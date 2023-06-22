class customer{ //客単体のデータ
    constructor(order, eatingTime){
        this.order = order; //注文内容
        this.eatingTime = eatingTime; //食事時間
    }
}
const order_ex = [1.5, 0]; //注文内容例 引数:麺の量,餃子の数
const eatingTime_ex = 24; //食事時間例 引数:コマ単位の時間

class group{ //客のグループ
    constructor(customerList){
        this.customerList;
    }
}


let customer1 = new customer(order_ex, eatingTime_ex);

console.log(customer1.order);
console.log(customer1.eatingTime);