interface Transaction {
  date: Date;
  type: "deposit" | "withdraw";
  amount: number;
  balance: number;
}

interface Account {
  balance: number;
  accountNumber: string;
  cardNumber: string;
  owner: string;
  getTransactionHistory(): Transaction[];
}

function generateRandomNumber(length: number): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

abstract class BaseAccount implements Account {
  balance: number;
  accountNumber: string;
  cardNumber: string;
  owner: string;
  protected transactions: Transaction[] = [];

  constructor(owner: string) {
    this.balance = 0;
    this.accountNumber = generateRandomNumber(20);
    this.cardNumber = generateRandomNumber(16);
    this.owner = owner;
  }

  protected addTransaction(type: "deposit" | "withdraw", amount: number) {
    this.transactions.push({
      date: new Date(),
      type,
      amount,
      balance: this.balance,
    });
  }

  getTransactionHistory(): Transaction[] {
    return [...this.transactions];
  }

  abstract withdraw(amount: number): boolean;
  abstract deposit(amount: number): void;
}

class DebitAccount extends BaseAccount {
  withdraw(amount: number): boolean {
    if (amount <= 0) {
      console.log("Сумма снятия должна быть больше нуля.");
      return false;
    }
    if (amount <= this.balance) {
      this.balance -= amount;
      this.addTransaction("withdraw", amount);
      console.log(
        `Снятие ${amount}₽ со счёта ${this.accountNumber}. Остаток: ${this.balance}₽`
      );
      return true;
    }
    console.log(`Недостаточно средств на счёте ${this.accountNumber}`);
    return false;
  }

  deposit(amount: number): void {
    if (amount <= 0) {
      console.log("Сумма пополнения должна быть больше нуля.");
      return;
    }
    this.balance += amount;
    this.addTransaction("deposit", amount);
    console.log(
      `Пополнение ${amount}₽ на счёт ${this.accountNumber}. Баланс: ${this.balance}₽`
    );
  }
}

class CreditAccount extends BaseAccount {
  private creditLimit: number;
  private debt: number;

  constructor(owner: string, creditLimit: number) {
    super(owner);
    this.creditLimit = creditLimit;
    this.debt = 0;
  }

  withdraw(amount: number): boolean {
    if (amount <= 0) {
      console.log("Сумма снятия должна быть больше нуля.");
      return false;
    }
    if (this.balance + this.creditLimit - this.debt >= amount) {
      if (amount <= this.balance) {
        this.balance -= amount;
      } else {
        const fromCredit = amount - this.balance;
        this.debt += fromCredit;
        this.balance = 0;
      }
      this.addTransaction("withdraw", amount);
      console.log(
        `Снятие ${amount}₽ со счёта ${this.accountNumber}. Остаток: ${this.balance}₽, Долг: ${this.debt}₽`
      );
      return true;
    }
    console.log(`Превышен кредитный лимит на счёте ${this.accountNumber}`);
    return false;
  }

  deposit(amount: number): void {
    if (amount <= 0) {
      console.log("Сумма пополнения должна быть больше нуля.");
      return;
    }
    let amountPaidToDebt = 0;

    if (this.debt > 0) {
      if (amount >= this.debt) {
        amountPaidToDebt = this.debt;
        amount -= this.debt;
        this.debt = 0;
      } else {
        amountPaidToDebt = amount;
        this.debt -= amount;
        amount = 0;
      }
    }

    if (amountPaidToDebt > 0) {
      this.addTransaction("deposit", amountPaidToDebt);
    }

    if (amount > 0) {
      this.balance += amount;
      this.addTransaction("deposit", amount);
    }

    console.log(
      `Пополнение счёта ${this.accountNumber}. Баланс: ${this.balance}₽, Долг: ${this.debt}₽`
    );
  }
}

const debitAccount = new DebitAccount("Хосе Карлос");
const creditAccount = new CreditAccount("Джеймс Бонд", 10000);

console.log("Операции с дебетовым счётом:");
console.log(`Держатель карты: ${debitAccount.owner}`);
debitAccount.deposit(5000);
debitAccount.withdraw(2000);
debitAccount.withdraw(4000);

console.log("\nИстория операций дебетового счёта:");
debitAccount.getTransactionHistory().forEach((transaction) => {
  console.log(
    `${transaction.date.toLocaleString()}: ${transaction.type} - ${
      transaction.amount
    }₽ (баланс: ${transaction.balance}₽)`
  );
});

console.log("\nОперации с кредитным счётом:");
console.log(`Держатель карты: ${creditAccount.owner}`);
creditAccount.withdraw(5000);
creditAccount.deposit(2000);
creditAccount.withdraw(7000);
creditAccount.deposit(10000);

console.log("\nИстория операций кредитного счёта:");
creditAccount.getTransactionHistory().forEach((transaction) => {
  console.log(
    `${transaction.date.toLocaleString()}: ${transaction.type} - ${
      transaction.amount
    }₽ (баланс: ${transaction.balance}₽)`
  );
});
