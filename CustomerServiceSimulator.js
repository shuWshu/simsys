// --------- parameter -----------
const VISIT_RATE = 0.4; //各コマでの来客率
const CPS = 1; //1秒間に何コマ進むか

// --------- class ---------------

class Order{
    constructor(menuA, menuB){
        this.menuA = menuA;
        this.menuB = menuB;
    }
}

//グループ内の注文の合計
class GroupOrder{
    constructor(){
        this.menuA = 0; //麺の量
        this.menuB = 0; //餃子の数
        this.num = 0; //人数
    }
    add(customer){ //1人分のデータ追加
        this.menuA += customer.order.menuA;
        this.menuB += customer.order.menuB;
        this.num += 1;
    }
    addGroup(customers){
        for(const customer of customers){
            this.add(customer);
        }
    }
}

//客の定義
class Customer{ //客
    constructor(order, eatingTime){
        this.order = order; //注文内容
        this.eatingTime = eatingTime; //食事時間
    }
}
//案内待ちグループの定義
const visitors = []; //案内待ちのグループ

//席の情報の定義
class Seat{ //席
    constructor(maxNum){
        this.maxNum = maxNum; //客の収容人数
        this.num = 0; //今いる客の数
        this.visitors = []; //客の内訳
        this.state = 0; //客の状態 0:居ない, 1:配膳待, 2:食事中
        this.maxEatingTime = 0; //食事時間最大
    }
    sit(customers, num){// 客が座る時の処理
        this.num = num;
        this.state = 1; //席状態を変更
        for(const customer of customers){ //客情報の格納
            this.visitors.push(customer);
            this.maxEatingTime = Math.max(this.maxEatingTime, customer.eatingTime);
        }
    }
}
const seatConfiguration = []; //座席のリスト

const cookingList = []; //調理中のグループ注文リスト

let worldTime = 0; //シミュレータ内の時間 単位はコマ
//TODO:時間経過での処理を作る

// --------- function ------------
//客来店
//客グループデータを作りvisitorsに追加
function visitCustomerNumN(visitors, num){
    //const num = Math.floor(Math.random() * 6) + 1; //1~6をランダムで取得
    const group = []
    for(let i = 0; i < num; ++i){
        const order = new Order(Math.floor(Math.random() * 3) + 2, Math.floor(Math.random() * 2)) //[2~4, 0~1]
        const eatingTime = Math.floor(Math.random() * 22) + 24; //24~45
        const customer = new Customer(order, eatingTime);
        group.push(customer);
        console.log(order, eatingTime);
    }
    visitors.push(group);
}

//座席に案内し，注文処理を呼び出す
//返値:成功なら案内席のインデックス, 客が居ないなら-1, 席が空いていないなら-2
function directToSeat(visitors, seatConfiguration, cookingList){
    if(!visitors.length){ return -1; } //客がいない
    const num = visitors[0].length; //先頭の客人数取得
    for(const [index, seat] of seatConfiguration.entries()){ //各座席について index:インデックス seat:席そのもの
        // 座れる場合
        if(num <= seat.maxNum && seat.num == 0){ //最大人数以下かつ座っていない
            seat.sit(visitors[0], num);
            takeOrders(visitors[0], cookingList);
            visitors.shift(); //先頭の客を削除
            return index;
        }
    }
    return -2;
}

//注文を取る処理
function takeOrders(customers, cookingList){
    const groupOrder = new GroupOrder(); //グループ内の注文合計
    groupOrder.addGroup(customers); //グループ注文の計算
    cookingList.push(groupOrder); //グループ注文をリストに保存
}

//席の更新
function PeopleViewUpdate(seatConfiguration){
    for(const [index, seat] of seatConfiguration.entries()){ //各座席につき
        const element = document.querySelector("#desk"+seat.maxNum+"_"+index);
        // console.log(element);
        if(element.classList.contains('color0')){
            element.classList.remove("color0");
            element.classList.add("color"+seat.state);
        }else if(element.classList.contains('color1')){
            element.classList.remove("color1");
            element.classList.add("color"+seat.state);
        }else if(element.classList.contains('color2')){
            element.classList.remove("color2");
            element.classList.add("color"+seat.state);
        }
    }
}

// --------- test code -----------



function setup(){
    // console.log(directToSeat(visitors)) //客が居ない時の確認
    // 席の配置
    for(let i = 0; i < 2; ++i){
        seatConfiguration.push(new Seat(1));
    }
    for(let i = 0; i < 4; ++i){
        seatConfiguration.push(new Seat(4));
    }
    for(let i = 0; i < 3; ++i){
        seatConfiguration.push(new Seat(6));
    }
    // console.log(seatConfiguration); //席リスト

    visitCustomerNumN(visitors, 4);
    visitCustomerNumN(visitors, 2);
    visitCustomerNumN(visitors, 5);
    //console.log(visitors) //生成された客リスト
    console.log(directToSeat(visitors, seatConfiguration, cookingList)) //案内先
    console.log(directToSeat(visitors, seatConfiguration, cookingList))
    console.log(directToSeat(visitors, seatConfiguration, cookingList))
    //console.log(visitors); //案内後の客リスト
    console.log(seatConfiguration); //席配置

    console.log(cookingList); //注文リスト

    worldTime = 0; //シミュレータ内の時間 単位はコマ
}

function main(){ //メインの処理
    console.log(worldTime);
    //客案内
    console.log(directToSeat(visitors, seatConfiguration, cookingList));

    //自動処理部分
    //確率で来客
    if(Math.random() < VISIT_RATE){
        const num = Math.floor(Math.random() * 6) + 1;
        visitCustomerNumN(visitors, num);
        console.log("visit!")
    }
    
    PeopleViewUpdate(seatConfiguration);
    console.log(visitors);


    worldTime += 1;
}
setup();
setInterval(main, 1000 / CPS); //繰り返し実行