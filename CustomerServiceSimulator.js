//客の定義
class Customer{ //客
    constructor(order, eatingTime){
        this.order = order; //注文内容
        this.eatingTime = eatingTime; //食事時間
    }
}
class Group{ //客のグループ
    constructor(customers){
        this.customers = customers; //客のリスト
        this.num = customers.length; //人数
    }
    add(customer){ //客の追加 引数:客
       this.customers.push(customer); 
       this.num += 1;
    }
}
//案内待ちグループの定義
class Visitors{ //案内待ちのグループ
    constructor(){
        this.groups = [];
    }
    add(group){ //来店時
        this.groups.push(group);
    }
    direct(){ //客の案内
        this.groups.shift();
    }
}
//席の情報の定義
class Seat{ //席
    constructor(maxNum){
        this.maxNum = maxNum; //客の収容人数
        this.num = 0; //今いる客の数
        this.state = 0; //客の状態
    }
}
class SeatConfiguration{ //座席リスト
    constructor(){
        this.seatConfiguration = [];
    }
    add(seat, n=1){ //座席追加 引数:席そのもの,数
        for(let i = 0; i < n; ++i){
            this.seatConfiguration.push(seat);
        }
    }
}

// --------- test code -----------

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

const seat4 = new Seat(4);
const seat6 = new Seat(6);
const restaurant = new SeatConfiguration();
restaurant.add(seat4, 4);
restaurant.add(seat6, 3);
console.log(restaurant);
