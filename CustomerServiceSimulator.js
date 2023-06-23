// --------- parameter -----------
const VISIT_RATE = 0.4; //各コマでの来客率
const CPS = 3; //1秒間に何コマ進むか
const VISITROS_SHOW = 10; //順番待ちの描画数
const PAYERS_SHOW = 5;

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
//客グループリストの定義
const visitors = []; //案内待ちのグループ
const payers = []; //会計待ちのグループ

//席の情報の定義
class Seat{ //席
    constructor(maxNum){
        this.maxNum = maxNum; //客の収容人数
        this.num = 0; //今いる客の数
        this.visitors = []; //客の内訳
        this.state = 0; //席の状態 0:居ない, 1:配膳待, 2:食事中, 3:片付け待ち
        this.maxEatingTime = 0; //食事時間最大
        this.startEatingTime = 0; //食事開始時間
    }
    sit(customers, num){// 客が座る時の処理
        this.num = num;
        this.state = 1; //席状態を変更
        for(const customer of customers){ //客情報の格納
            this.visitors.push(customer);
            this.maxEatingTime = Math.max(this.maxEatingTime, customer.eatingTime);
        }
    }
    eatStart(time){ //食事開始
        this.state = 2; //席状態を変更
        this.startEatingTime = time;
        //console.log("start:"+this.startEatingTime+", max:"+this.maxEatingTime)
    }
    goBack(){ //帰宅
        this.state = 3; //席状態を変更
        this.maxEatingTime = 0;
        this.startEatingTime = 0;
    }
    cleaned(){ //掃除
        this.num = 0;
        this.visitors = [];
        this.state = 0;
    }
}
const seatConfiguration = []; //座席のリスト

const cookingList = []; //調理中のグループ注文リスト

let worldTime = 0; //シミュレータ内の時間 単位はコマ

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
        //console.log(order, eatingTime);
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
        if(num <= seat.maxNum && seat.state == 0){ //最大人数以下かつ座っていない
            seat.sit(visitors[0], num);
            takeOrders(visitors[0], cookingList);
            visitors.shift(); //先頭の客を削除

            seat.eatStart(worldTime); //TODO:席配置時に食事スタート
            return index;
        }
    }
    return -2; //座れない
}

//注文を取る処理
function takeOrders(customers, cookingList){
    const groupOrder = new GroupOrder(); //グループ内の注文合計
    groupOrder.addGroup(customers); //グループ注文の計算
    cookingList.push(groupOrder); //グループ注文をリストに保存
}

//食事終了時処理
function eatingEnd(seatConfiguration, payers, time){
    for(const [index, seat] of seatConfiguration.entries()){ //各座席について index:インデックス seat:席そのもの
        if(seat.state == 2){ //食事中の場合
            if((time - seat.startEatingTime) == seat.maxEatingTime){//食事終了
                //console.log("eat end:"+index);
                payers.push(seat.visitors); //会計待ちへグループを格納
                seat.goBack(); //席を片付け前に更新
            }
        }
    }
}

//会計処理
function account(payers){
    payers.shift(); //リスト先頭の客を削除
}

//席の掃除
//席リストを渡すとインデックスが若い席を掃除する
function cleaning(seatConfiguration){
    for(const [index, seat] of seatConfiguration.entries()){ //各座席について index:インデックス seat:席そのもの
        if(seat.state == 3){ //席が片付け待ち
            seat.cleaned(); //席掃除
            return 1;
        }
    }
    return -1;
}

// --------- draw function -------
//客描画情報の更新
function PeopleViewUpdate(visitors, seatConfiguration, payers){
    //席の表示
    for(const [index, seat] of seatConfiguration.entries()){ //各座席につき
        const desk = document.querySelector("#desk"+seat.maxNum+"_"+index);
        // console.log(desk);
        for(let i = 0; i < seat.maxNum; ++i){
            const human = desk.querySelector(".human"+i);
            //console.log(human);
            let state = seat.state;
            if(i >= seat.num){ state = 0; } //座っている人数に合わせる
            colorReset(human, state); //カラーのリセット
        }
    }
    //並んでる客の表示
    for(let i = 0; i < VISITROS_SHOW; ++i){ //描画最大数まで処理
        const customers = visitors[i];
        let state = 0;
        let num = 0;
        if(customers){ //人が居るなら行う
            num = customers.length;
            state = 1;
        }
        const visitor = document.querySelector("#visitor").querySelector(".humanV"+i);
        const viewText = visitor.querySelector(".num");
        colorReset(visitor, state); //カラーのリセット
        viewText.textContent = num;
    }
    // 3点リーダの表示
    let state = 0;
    const customers = visitors[VISITROS_SHOW];
    if(customers){ state = 1; } //人が居るなら
    const visitorView = document.querySelector("#visitor").querySelector(".moreHuman");
    colorReset(visitorView, state); //カラーのリセット
    //会計待ちの客の表示
    for(let i = 0; i < PAYERS_SHOW; ++i){ //描画最大数まで処理
        const payer = payers[i];
        let state = 0;
        if(payer){ state = 1; }//人が居るなら行う
        const payerView = document.querySelector("#payer").querySelector(".humanP"+i);
        colorReset(payerView, state); //カラーのリセット
    }
}

function timerViewUpdate(time){
    const timer = document.querySelector("#timer");
    timer.textContent = ("00"+Math.floor((12+time/180)%24)).slice(-2)+":"+
                        ("00"+Math.floor(time/3%60)).slice(-2)+":"+
                        ("00"+(time%3)*20).slice(-2); //時間表記
}

function colorReset(element, state){
    //カラーのリセット
    element.classList.remove("color0");
    element.classList.remove("color1");
    element.classList.remove("color2");
    element.classList.remove("color3");
    element.classList.add("color"+state); //正しい色の追加
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

    worldTime = 0; //シミュレータ内の時間 単位はコマ

    PeopleViewUpdate(visitors, seatConfiguration, payers);
    timerViewUpdate(worldTime);
}

function main(){ //メインの処理
    console.log("time:"+worldTime);
    //客案内
    directToSeat(visitors, seatConfiguration, cookingList);
    account(payers);
    cleaning(seatConfiguration);

    //自動処理部分
    //確率で来客
    if(Math.random() < VISIT_RATE){
        const num = Math.floor(Math.random() * 6) + 1;
        visitCustomerNumN(visitors, num);
        // console.log("visit!")
    }
    eatingEnd(seatConfiguration, payers, worldTime);
    PeopleViewUpdate(visitors, seatConfiguration, payers); //描画更新
    timerViewUpdate(worldTime);


    worldTime += 1;
}
setup();
setInterval(main, 1000 / CPS); //繰り返し実行
