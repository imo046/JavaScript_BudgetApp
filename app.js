//budget controller
var budgetController = (function()
{

    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentages = function(totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome)*100);
        }
        else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;
        dataStore.allItems[type].forEach(function(curr){
            sum = sum + curr.value;
        });
        dataStore.totals[type] = sum;
    };

    var dataStore = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type,des,val) {
            var newItem, ID;
            //create new ID
            if (dataStore.allItems[type].length > 0){
                ID = dataStore.allItems[type][dataStore.allItems[type].length-1].id+1;
            }
            else {
                ID = 0;
            }

            //create new item based on type
            if (type === 'exp'){
                newItem = new Expense(ID,des,val);
            }
            else {
                newItem = new Income(ID,des,val);
            }
            //push it into data structure
            dataStore.allItems[type].push(newItem);
            //return new element
            return newItem;
        },

        deleteItem: function(type, id) {

            var index;
            var ids = dataStore.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index >= 0) {
                dataStore.allItems[type].splice(index,1);
                console.log('item deleted!');
            }
        },
        calculateBudget: function() {

            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            //calculate budget
            dataStore.budget = dataStore.totals.inc - dataStore.totals.exp;
            //calculate the percentage of income that we spent
            if (dataStore.totals.inc > 0){
                dataStore.percentage = Math.round((dataStore.totals.exp / dataStore.totals.inc)*100);
            }
            else {
                dataStore.percentage = -1;
            }
        },

        calculatePercentages: function() {

            dataStore.allItems.exp.forEach(function(curr){
                curr.calculatePercentages(dataStore.totals.inc);
            });
        },

        getPercentage: function() {

            var allPerc = dataStore.allItems.exp.map(function(cur){
               return cur.getPercentage();
            });

            return allPerc;
        },

        getBudget: function() {
            return {
                budget: dataStore.budget,
                totalInc: dataStore.totals.inc,
                totalExp: dataStore.totals.exp,
                percentage: dataStore.percentage
            };
        },

        testing: function() {
            console.log(dataStore);
        }
    };

})();

//ui controller
var UIController = (function()
{
    var DOMStrings = {
        inputType: '.add__type',
        inputDesciption: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expencesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month',


    };

     //for every node list
    var nodeListForEach = function(list,callback) {
        for (var i = 0;i<list.length;i++) {
            callback(list[i],i);
        }
    };
    //Getting info
    return {
        getInput: function(){

        return{
             type: document.querySelector(DOMStrings.inputType).value,// inc or exp
             descript: document.querySelector(DOMStrings.inputDesciption).value,
             value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
        };
      },

       addListItem: function(obj,type){
           //create html string with plaseholder text
          var html, newHtml,elem;

        if (type === 'inc'){
            elem = DOMStrings.incomeContainer;
           html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        }
          else {
              elem = DOMStrings.expencesContainer;
           html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
          }
           //replace plaseholder text with real data
           newHtml = html.replace('%id%',obj.id);
           newHtml = newHtml.replace('%description%',obj.description);
           newHtml = newHtml.replace('%value%',this.formatNumber(obj.value,type));

           //Insert html into the DOM
           document.querySelector(elem).insertAdjacentHTML('beforeend',newHtml);

       },
       getDOMStrings: function(){
          return DOMStrings;
       },

        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields,fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDesciption + ', '+ DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);// from list to array
            fieldsArr.forEach(function(current,index,arr){
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj){

            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = this.formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = this.formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = this.formatNumber(obj.totalExp,'exp');

            if (obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '__%';
            }


        },


        displayPercentages: function(percentagesArr) {

          var fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

          nodeListForEach(fields, function(current,index) {

              if (percentagesArr[index] > 0) {
              current.textContent = percentagesArr[index] + '%';
            }
              else {
                  current.textContent = '__%'
              }
          });

        },

        displayMonth: function() {
          var now, year, month,monthArr;
          now = new Date();
          year = now.getFullYear();
          month = now.getMonth();
          monthArr = ['January','February','March','April','May','June','July','August','September','October','November','December'];
          document.querySelector(DOMStrings.dateLabel).textContent = monthArr[month] + ' ' + year;
        },

        formatNumber: function(number,type){
          
            var numSplit,int,dec,sign;
            number = Math.abs(number);
            number = number.toFixed(2);

            numSplit = number.split('.');
            int  = numSplit[0];
            dec = numSplit[1];

            if(int.length > 3){
                int = int.substr(0,(int.length - 3)) + ',' + int.substr((int.length - 3),3);//3
            }

            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        },

        changedType: function() {

            var fields = document.querySelectorAll(
              DOMStrings.inputType + ',' +
              DOMStrings.inputDesciption + ',' +
              DOMStrings.inputValue);

            nodeListForEach(fields,function(curr){
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },
    };

})();

//app controller
var controller = (function(budgetC,UIC)
{
    var DOMS = UIC.getDOMStrings();
    var setupEventListeners = function(){
     document.querySelector(DOMS.inputBtn).addEventListener('click',cntrlAddItem);

     document.addEventListener('keypress',function(event)
                              {
        if (event.keyCode === 13 || event.which === 13){
            console.log('Enter pressed');
            cntrlAddItem();
        }
    });

    document.querySelector(DOMS.container).addEventListener('click',cntrlDeleteItem);
    document.querySelector(DOMS.inputType).addEventListener('change',UIC.changedType)


   };



    var updateBudget = function(){
        //calculate budget
        budgetC.calculateBudget();

        //return budget
        var budget = budgetC.getBudget();

        //display budget on UI
        UIC.displayBudget(budget);
    };

    var updatePercentages = function() {
        //1. Calculate percentages
        budgetC.calculatePercentages();

        //2. Read percentages from budget controller
        var percentages = budgetC.getPercentage();

        //3. Update UI
        UIC.displayPercentages(percentages);
    }

    var cntrlAddItem = function()
    {
        //get input data,
        var input, newItem;
        input = UIC.getInput();
        console.log(input);
        if (input.descript !== "" && !isNaN(input.value) && input.value > 0){

        //add item to budget controller,
        newItem = budgetC.addItem(input.type,input.descript,input.value);

        //add new item to user interface
        UIC.addListItem(newItem,input.type);

        //clear the fields
        UIC.clearFields();

        //calculate and update the budget
        updateBudget();

        //calculate and update percentages
        updatePercentages();


      }

    };
    var cntrlDeleteItem = function(event)
    {

        var itemID,splitID,type,ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID)
        {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. delete item from data structure
            budgetC.deleteItem(type,ID);

            //2. delete item from UI
            UIC.deleteListItem(itemID);

            //3. Update budget
            updateBudget();

            //calculate and update percentages
            updatePercentages();
        }

    };

    return {
        init: function(){
            console.log('App started');
            UIC.displayMonth();
            UIC.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController,UIController);

controller.init();
