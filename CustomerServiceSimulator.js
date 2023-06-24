// --------- parameter -----------
const VISIT_RATE = 0.1; //各コマでの来客率
const VISIT_NUM = [4, 4, 2, 2, 1, 1];
const CPS = 1; //1秒間に何コマ進むか
const VISITROS_SHOW = 10; //順番待ちの描画数
const PAYERS_SHOW = 5;
const TIME_LIMIT = 3 * 60 * 3;

// --------- class ---------------
//注文
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
        this.servedNum = 0; //配膳済人数
        this.seatNo = 0;
    }
    add(customer){ //1人分のデータ追加
        this.menuA += customer.order.menuA;
        this.menuB += customer.order.menuB;
        this.num += 1;
    }
    addGroup(customers, seatNo){ //グループ丸々のデータ追加
        for(const customer of customers){
            this.add(customer);
        }
        this.seatNo = seatNo;
    }
}
const groupOrderList = []; //調理中のグループ注文リスト 合計のオーダーが入ってる

//客の定義
class Customer{ //客
    constructor(order, eatingTime){
        this.order = order; //注文内容
        this.eatingTime = eatingTime; //食事時間
    }
}
//客グループリストの定義
const visitors = []; //案内待ちのグループ

//席の情報の定義
class Seat{ //席
    constructor(maxNum){
        this.maxNum = maxNum; //客の収容人数
        this.num = 0; //今いる客の数
        this.visitors = []; //客の内訳
        this.state = 0; //席の状態 0:居ない, 1:配膳待, 2:食事中, 3:片付け待ち, 3.5:片付け中, 4:片付け後
        this.maxEatingTime = 0; //食事時間最大
        this.startEatingTime = 0; //食事開始時間
        this.menuA = 0; //メニューAの量
        this.menuB = 0; //メニューBの量
    }
    sit(customers, num){// 客が座る時の処理
        this.num = num;
        this.state = 1; //席状態を変更
        for(const customer of customers){ //客情報の格納
            this.visitors.push(customer);
            this.maxEatingTime = Math.max(this.maxEatingTime, customer.eatingTime);
            this.menuA += customer.order.menuA;
            this.menuB += customer.order.menuB;
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
        this.menuA = 0;
        this.menuB;
    }
    cleaning(){ //掃除
        this.state = 3.5;
    }
    cleaned(){ //掃除
        this.num = 0;
        this.visitors = [];
        this.state = 4;
    }
    resetState(){
        this.state = 0;
    }
}
const seatConfiguration = []; //座席のリスト

class CookingMenu{
    constructor(maxAmount, cookingTime){
        this.amount = 0;
        this.startCookingTime = 0;
        this.maxAmount = maxAmount;
        this.cookingTime = cookingTime;
    }
    start(amount, time){ //調理開始 maxより多いなら-1を返す
        if(amount > this.maxAmount){ return -1; }
        this.amount = amount;
        this.startCookingTime = time;
    }
    cooked(){ //調理完了
        this.amount = 0;
        this.startCookingTime = 0;
    }
}
let cookingMenuA = new CookingMenu(60, 24); //調理中のメニューAの量
let cookingMenuB = new CookingMenu(5, 15); //調理中のメニューBの量
const cookingMenus = [cookingMenuA, cookingMenuB]; //調理中リスト
const cookedMenus = [0, 0] //調理済リスト A, B

class Payer{
    constructor(num, menuA, menuB){
        this.num = num;
        this.menuA = menuA;
        this.menuB = menuB;
    }
}
const payers = []; //会計待ちのグループ

//店員
class Clerk{
    constructor(priority){
        this.doing = 0; //何をしているか 0:待機, 1:案内中, 2:配膳中, 3:掃除中, 4:レジ
        this.going = -1; //向かってる席のインデックス 待機とレジは-1
        this.priority = priority; //仕事の優先順位
        this.waitFrag = false; //次のターン待機する合図
    }
    setDoing(doing, going){
        this.doing = doing;
        this.going = going;
    }
    willWait(){
        this.waitFrag = true;
    }
    toWait(){
        this.doing = 0;
        this.going = -1;
        this.waitFrag = false;
    }
}
const clerks = []; //店員リスト

const total = [0, 0]; //合計の 客数, 売上

let worldTime = 0; //シミュレータ内の時間 単位はコマ

// --------- function ------------
//0~n-1の間で偏ったダイス
//引数: [0の比率, 1の比率, 2の比率, ...]
function randamizer(num){
    const total = num.reduce(function(a, b){ return a + b; }) //合計
    const r = Math.random();
    let a = 0;
    for(let i = 0; i < num.length - 1; ++i){
        a += num[i] / total;
        if(r<a) { return i; }
    }  
    return num.length - 1;
}

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
        // console.log(order, eatingTime);
    }
    visitors.push(group);
}

//店員タスク:1
//座席に案内しする
//返値:成功なら1, 客が居ないなら-1, 席が空いていないなら-2
function directToSeat(visitors, seatConfiguration, clerk){
    if(!visitors.length){ return -1; } //客がいない
    const num = visitors[0].length; //先頭の客人数取得
    for(const [index, seat] of seatConfiguration.entries()){ //各座席について index:インデックス seat:席そのもの
        // 座れる場合
        if(num <= seat.maxNum && seat.state == 0){ //最大人数以下かつ座っていない
            seat.sit(visitors[0], num);
            clerk.setDoing(1, index);
            visitors.shift(); //先頭の客を削除
            return 1;
        }
    }
    return -2; //座れない
}

//店員タスク
//注文を取る処理
function takeOrders(customers, groupOrderList, clerk){
    const groupOrder = new GroupOrder(); //グループ内の注文合計
    groupOrder.addGroup(customers, clerk.going); //グループ注文の計算
    groupOrderList.push(groupOrder); //グループ注文をリストに保存
    clerk.willWait();
}

//調理開始
//調理済みなら-1を返す
function cookingStart(cookingMenu, amount, time){
    if(cookingMenu.amount > 0){ 
        //console.log("already cooking");
        return -1;
    }
    cookingMenu.start(amount, time);
}

//調理終了時処理
function cookingEnd(cookingMenus, cookedMenus, time){
    for(const [index, cookingMenu] of cookingMenus.entries()){ //各調理中メニューについて
        if((time - cookingMenu.startCookingTime) == cookingMenu.cookingTime){
            cookedMenus[index] += cookingMenu.amount;
            cookingMenu.cooked();
            //console.log("cooking end");
        }
    }
}

//店員タスク:2
//配膳
//先頭要素の1人分の配膳
//成功で2, オーダーがない場合-1, 量が足りないなら-2を返す
function serve(groupOrderList, cookedMenus, seatConfiguration, clerk){
    const groupOrder = groupOrderList[0];
    if(!groupOrder){ return -1; } // オーダー無し
    if(groupOrder.menuA <= cookedMenus[0] && groupOrder.menuB <= cookedMenus[1]){//配膳可能
        clerk.setDoing(2, groupOrder.seatNo);
        clerk.willWait();
        groupOrder.servedNum += 1;
        if(groupOrder.servedNum == groupOrder.num){ //配膳し終わった
            cookedMenus[0] -= groupOrder.menuA;
            cookedMenus[1] -= groupOrder.menuB;
            seatConfiguration[groupOrder.seatNo].eatStart(worldTime);
            groupOrderList.shift();
            console.log("served to "+groupOrder.seatNo+": end!");
            return 2;
        }
        console.log("served to "+groupOrder.seatNo+": "+groupOrder.servedNum+"/"+groupOrder.num);
        return 2;
    }else{
        return -2;
    }
}

//食事終了時処理
function eatingEnd(seatConfiguration, payers, time){
    for(const [index, seat] of seatConfiguration.entries()){ //各座席について index:インデックス seat:席そのもの
        if(seat.state == 2){ //食事中の場合
            if((time - seat.startEatingTime) == seat.maxEatingTime){ //食事終了
                //console.log("eat end:"+index);
                payers.push(new Payer(seat.num, seat.menuA, seat.menuB)); //会計待ちへグループを格納
                seat.goBack(); //席を片付け前に更新
            }
        }
    }
}

//会計処理
//処理ができたら1, できなかったら-1を返す
function account(payers, total){
    if(payers.length){ //客がいる
        const payer = payers[0]
        total[0] += payer.num;
        total[1] += calculateMenuA(payer.num, payer.menuA);
        total[1] += calculateMenuB(payer.menuB);
        //console.log(total[0]+": "+total[1]);
        payers.shift(); //リスト先頭の客を削除
        return 1;
    }else{
        return -1;
    }
}

//メニューAの金額を返す
function calculateMenuA(num, menuA){
    return num * 750 + (menuA - num * 2) * 50;
}

function calculateMenuB(menuB){
    return menuB * 400;
}

//店員タスク:3
//席の掃除開始
//インデックスが若い席のみ掃除する
//掃除したら3, しなかったら-1を返す
function cleaning(seatConfiguration, clerk){
    for(const [index, seat] of seatConfiguration.entries()){ //各座席について index:インデックス seat:席そのもの
        if(seat.state == 3){ //席が片付け待ち
            seat.cleaning(); //席掃除
            clerk.setDoing(3, index);
            return 3;
        }
    }
    return -1;
}

//席の掃除終了
function cleaned(seatConfiguration, clerk){
    seatConfiguration[clerk.going].cleaned(); //掃除終了
    clerk.willWait();
}

//待機に変更
function toWait(clerks){
    for(const clerk of clerks){
        if(clerk.waitFrag){
            clerk.toWait();
        }
    }
}

// --------- draw function -------
//客描画情報の更新
function PeopleViewUpdate(visitors, seatConfiguration, payers, clerks){
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
    //店員の表示
    for(const [index, clerk] of clerks.entries()){
        const doing = clerk.doing;
        const clerkView = document.querySelector("#clerk"+index);
        if(doing == 0){ //休憩中
            colorReset(clerkView.querySelector(".wait"), 1);
        }else{
            colorReset(clerkView.querySelector(".wait"), 0);
        }
        let seatNo = -1;
        let state = 0;
        if(doing > 0 && doing <= 3){ //仕事中
            seatNo = clerk.going;
            state = doing
        }
        for(let i = 0; i < seatConfiguration.length; ++i){
            if(i == seatNo){ //向かっている席番のみ
                colorReset(clerkView.querySelector(".go"+i), state);
            }else{
                colorReset(clerkView.querySelector(".go"+i), 0);
            }
        }
        if(doing == 4){
            colorReset(clerkView.querySelector(".goRegister"), 1);
        }else{
            colorReset(clerkView.querySelector(".goRegister"), 0);
        }
    }
}

//タイマーの表示
function timerViewUpdate(time){
    const timer = document.querySelector("#timer");
    timer.textContent = ("00"+Math.floor((12+time/180)%24)).slice(-2)+":"+
                        ("00"+Math.floor(time/3%60)).slice(-2)+":"+
                        ("00"+(time%3)*20).slice(-2); //時間表記
}

//料理の表示
function dishViewUpdate(cookingMenus, cookedMenus){
    for(const [index, cookingMenu] of cookingMenus.entries()){
        const potView = document.querySelector("#cookingMenu"+index);
        let state = 0;
        const amount = cookingMenu.amount;
        if(amount > 0){ state = 2; }
        const dishView = potView.querySelector(".dish");
        colorReset(dishView, state);
        potView.querySelector(".amount").textContent = amount;
    }
    for(const [index, cookedMenu] of cookedMenus.entries()){
        const potView = document.querySelector("#cookedMenu"+index);
        let state = 0;
        const amount = cookedMenu;
        if(amount > 0){ state = 2; }
        const dishView = potView.querySelector(".dish");
        colorReset(dishView, state);
        potView.querySelector(".amount").textContent = amount;
    }
}

function totalViewUpdate(total){
    const totalView = document.querySelector("#total");
    totalView.querySelector(".number").textContent = "Total number: "+total[0];
    totalView.querySelector(".sales").textContent = "Total sales: "+total[1];
}

function colorReset(element, state){
    //カラーのリセット
    element.classList.remove("color0");
    element.classList.remove("color1");
    element.classList.remove("color2");
    element.classList.remove("color3");
    element.classList.add("color"+Math.floor(state)); //正しい色の追加
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

    //店員召喚
    clerks.push(new Clerk([4, 2, 1, 3]));
    clerks.push(new Clerk([4, 2, 1, 3]));
    clerks.push(new Clerk([4, 2, 1, 3]));

    visitCustomerNumN(visitors, 4);
    visitCustomerNumN(visitors, 2);
    visitCustomerNumN(visitors, 5);

    worldTime = 0; //シミュレータ内の時間 単位はコマ

    PeopleViewUpdate(visitors, seatConfiguration, payers, clerks);
    timerViewUpdate(worldTime);
}

function main(){ //メインの処理
    console.log("time:"+worldTime);
    //TODO:店員概念の追加
    //TODO:注文を取った時にメニューができていると次のエージェントがすぐ配膳するバグあり
    //店員の動き
    for(const [index, clerk] of clerks.entries()){//各店員について
        if(clerk.doing == 0){ //待機中なら
            for(let i = 0; i < 4; ++i){ //作業の優先順位に従う
                let resurt = 0; //結果の格納
                if(clerk.priority[i] == 1){
                    resurt = directToSeat(visitors, seatConfiguration, clerk);
                }else if(clerk.priority[i] == 2){
                    resurt = serve(groupOrderList, cookedMenus, seatConfiguration, clerk);
                }else if(clerk.priority[i] == 3){
                    resurt = cleaning(seatConfiguration, clerk);
                }else if(clerk.priority[i] == 4){
                    resurt = account(payers, total);
                }
                if(resurt > 0){ console.log("clerk"+index+" do: "+resurt); break; } //仕事を行ったら抜ける
                if(i == 3){ console.log("clerk"+index+" do: nan"); }
            }
        }else if(clerk.doing == 1){
            takeOrders(seatConfiguration[clerk.going].visitors, groupOrderList, clerk);
            console.log("clerk"+index+" do: 1");
        }else if(clerk.doing == 3){
            cleaned(seatConfiguration, clerk);
            console.log("clerk"+index+" do: 3");
        }
    }

    //TODO:料理量調整の追加
    for(const cookingMenu of cookingMenus){
        cookingStart(cookingMenu, cookingMenu.maxAmount, worldTime);
    }

    //自動処理部分
    //確率で来客
    if(Math.random() < VISIT_RATE){
        const num = randamizer(VISIT_NUM) + 1;
        visitCustomerNumN(visitors, num);
    }
    cookingEnd(cookingMenus, cookedMenus, worldTime);
    eatingEnd(seatConfiguration, payers, worldTime);
    for(const seat of seatConfiguration){
        if(seat.state == 4){ seat.resetState(); }
    }

    //描画更新
    PeopleViewUpdate(visitors, seatConfiguration, payers, clerks); 
    timerViewUpdate(worldTime);
    dishViewUpdate(cookingMenus, cookedMenus);
    totalViewUpdate(total);

    toWait(clerks);
    if(worldTime == TIME_LIMIT){
        console.log("end");
        clearInterval(timerId);
    }
    worldTime += 1;
}
setup();
const timerId = setInterval(main, 1000 / CPS); //繰り返し実行
