import * as  from "./CustomerServiceSimulator" 

const order_ex = [1.5, 0]; //注文内容例 引数:麺の量,餃子の数
const eatingTime_ex = 24; //食事時間例 引数:コマ単位の時間
const order_ex2 = [2, 1]; //注文内容例 引数:麺の量,餃子の数
const eatingTime_ex2 = 45; //食事時間例 引数:コマ単位の時間
const visitors = new Visitors();

let customer1 = new Customer(order_ex, eatingTime_ex);
let customer2 = new Customer(order_ex2, eatingTime_ex2);
let enptylist = [];
let group1 = new Group(enptylist)
group1.add(customer1);
group1.add(customer2);

console.log(group1.customers[0].order);
console.log(group1.customers[0].eatingTime);
console.log(group1.num);

visitors.add(group1);
visitors.add(group1);
console.log(visitors.groups);
visitors.direct();
console.log(visitors.groups);
