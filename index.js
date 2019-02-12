(function (global) {

    if (!window.localStorage) {
        throw "Your browser does not support Local Storage"
    }

    function modCell(x, y, loot, text) {
        //define 
    }

    function GameSave() {
        this.playerName = "Player 1";
        this.food = 10;
        this.ammo = 100;
        this.energy = 15;
        this.maxEnergy = 15;
        this.hp = 10;
        this.maxhp = 10;
        this.armour = 0;
        this.inventory = new inventory(150);
        this.saveFile = JSON.stringify(this);
    }



    var qs = function (selector) {
        return document.querySelector(selector);
    };

    function Directions() {
        this.up = 0;
        this.right = 1;
        this.down = 2;
        this.left = 3;
    }
    /*Directions.prototype.up = function () { return 0 };
    Directions.prototype.right = function () { return 1 };
    Directions.prototype.down = function () { return 2 };
    Directions.prototype.left = function () { return 3 };*/

    function GameObject() {
        this.player = qs('#player');
        this.box = qs('#box');
        this.logEl = qs('#log');
        this.currentCell = 312;
        this.facing = Directions.up;
        this.ammo = 100;
        this.health = 10;
        this.maxHealth = 10;
        this.steps = 0;
        this.energy = 15;
        this.ammoUsed = 0;
        this.name = 'Default Noob';
        this.lootArray = [];
        this.fightingMode = false;
        this.saveBoxHTML;
        this.playerFightingOrigin;
        this.enemy = qs('#enemy');
        this.enemyMaxHealth = 10;
        this.enemyHealth = this.enemyMaxHealth;
        this.playerIsShooting = false;
        this.enemyDecisionInterval;
        this.fightHealthEl = qs('#fight-health');
        this.enemyHealthEl = qs('#enemy-health');
        this.gameProgression = 0;
        this.regenDegenInterval;
        this.isTown = false;
        this.armour = false;
        this.generatedMap;
        this.lootHeading = qs('#loot-heading');
        this.playEl = qs("#play_button");
        this.inventory = new inventory(150);
        this.elements = {
            foodEl: qs('#food'),
            lootEl: qs('#loot'),
            nameEl: qs('#name'),
            ammoEl: qs('#ammo'),
            healthEl: qs('#health'),
            energyEl: qs('#energy'),
            ammoUsedEl: qs('#ammo-used'),
            stepsEl: qs('#step-taken'),
            ammoTakes: qs('#ammotakes'),
            foodTakes: qs('#foodtakes'),
            lootAmmo: qs('#lootammonum'),
            lootFood: qs('#lootfoodnum'),
            lootArmour: qs('#lootarmournum'),
            lootAmmoWrap: qs('#lootammo'),
            lootFoodWrap: qs('#lootfood'),
            lootArmourWrap: qs('#lootarmour')
        };
        this.getCoords = function () {
            var a = this.currentCell;
            while (a < 300 || a > 324) {
                if (a < 300) {
                    a += 25;
                } else if (a > 324) {
                    a -= 25;
                }
            }
            var o = Math.floor(this.currentCell / 25) * 25 + 12;
            var coords = { x: a - 312, y: (312 - o) / 25 };
            return coords;
        }
        console.log(this.getCoords());
    };

    GameObject.prototype.detectHit = function (bulletEl, target) {
        var b = bulletEl.getBoundingClientRect();
        var t = target.getBoundingClientRect();
        return (b.top <= t.top + 20
            && b.top >= t.top - 20
            && target.style.display != 'none'
            && b.left >= t.left - 20
            && b.left <= t.left + 20);
    };

    GameObject.prototype.takeF = function (item, amount) {
        if (item == 'ammo') {
            if (amount == 'all') {
                this.ammo += this.lootArray[this.currentCell].ammo;
                this.lootArray[this.currentCell].ammo = 0;
            } else {
                this.lootArray[this.currentCell].ammo--;
                this.ammo++;
            }
        }
        if (item == 'food') {
            if (amount == 'all') {
                this.food += this.lootArray[this.currentCell].food;
                this.lootArray[this.currentCell].food = 0;
            } else {
                this.lootArray[this.currentCell].food--;
                this.food++;
            }
        }
        var itemEval = eval(item);
        if (amount == 'all') {
            this.itemEval += this.lootArray[this.currentCell].itemEval;
            this.lootArray[this.currentCell].ammo = 0;
        } else {
            this.lootArray[this.currentCell].itemEval--;
            this.itemEval++;
        }
        this.ammoEl.innerHTML = 'Ammo: ' + this.ammo;
        this.foodEl.innerHTML = 'Food: ' + this.food + ' [E to eat]';
        this.lootAmmo.innerHTML = this.lootArray[this.currentCell].ammo;
        this.lootFood.innerHTML = this.lootArray[this.currentCell].food;
        this.lootAmmoWrap.style.display = ((this.lootArray[this.currentCell].ammo == 0) ? 'none' : 'block');
        this.lootFoodWrap.style.display = ((this.lootArray[this.currentCell].food == 0) ? 'none' : 'block');
    };

    var game = new GameObject();

    GameSave.prototype.load = function () {
        var data = window.localStorage.getItem("exp-game/save");
        if (data != null)
            return JSON.parse(data);
        return new GameObject();
    };

    GameSave.prototype.save = function () {
        window.localStorage.setItem('exp-game/save', JSON.stringify(global._exp_game));
    }

    global._exp_game = ((global._exp_game != null) ? global._exp_game : (new GameSave()).load());

    function shadedText(text) {
        return "<span class='shaded'>" + text + "</span>";
    }

    function inventory(space, items) {
        this.space = space;
        this.items = items || [];
        this.elements = {
            spaceused: {
                main: document.getElementById('spaceused'),
                occupied: document.getElementById('occupied'),
                available: document.getElementById('available'),
                percent: document.getElementById('percent')
            },
            stats: document.getElementById('inventory-stats')
        };
        this.updateElements = function () {
            var a = [];
            for (var i = 0; i < 15; i++) {
                a[i] = '#';
            }
            var b = 0;
            for (var k = 0; k < this.items.length; k++) {
                b += this.items[k].amount;
            }
            var c = Math.round(b / this.space * 15);
            for (var i = 0; i < c; i++) {
                a[i] = '$';
            }
            console.log(a);
            this.elements.spaceused.innerText = '';
            var o = this;
            a.forEach(function (element) {
                if (element == "$") {
                    o.elements.spaceused.occupied.innerHTML += element;
                } else {
                    o.elements.spaceused.available.innerHTML += element;
                }
            });
            this.elements.spaceused.percent.innerHTML = ' (' + b / this.space * 100 + '% occupied)';
            var j = this;
            this.items.forEach(function (element) {
                j.elements.stats.innerHTML += element.amount + ' ' + element.itemName + shadedText(' (' + element.amount / j.space * 100 + '% of inventory)') + '<br>';
            });
        }
    }

    function item(item, amount) {
        this.itemName = item;
        this.amount = amount;
    }

    inventory.prototype.addItem = function (ITEM) {
        var t = 0;
        this.items.forEach(function (element) {
            t += element.amount;
        });
        if (t == this.space) {
            //oops, inventory has no more space
        } else if (ITEM.amount + t > this.space) {
            ITEM.amount -= (this.space - t);
            var tempItem = new item(ITEM.itemName, this.space - t);
            this.items.push(tempItem);
        } else {
            this.items.push(ITEM);
        }
        if (this.items.filter(item => (item.itemName == ITEM.itemName))[1] != undefined) {
            this.items.filter(item => (item.itemName == ITEM.itemName))[0].amount += ITEM.amount;
            var r = this.items.indexOf(ITEM);
            this.items.splice(r, 1);
        }
    };

    var anItem = new item('b lasagna', 123);
    var shoes = new item('shoes', 150);
    var tekashi = new item('6ix9ine', 69);

    //inventory1.addItem(anItem);

    //inventory1.addItem(new item('shoes', 300));

    //game.inventory.addItem(new item('shoes', 300));

    //game.inventory.addItem(shoes);

    game.inventory.addItem(tekashi);

    game.inventory.updateElements();

    console.log(game.inventory);

    var tbl = ['<table><tr>'];

    for (var i = 0; i < 625; i++) {
        tbl.push("<td id='c" + i + "'></td>");
        if ((i + 1) % 25 == 0)
            tbl.push('</tr><tr>');
    }

    tbl.push('</tr></table>');
    box.innerHTML = tbl.join('');

    var tds = document.querySelectorAll('td');

    GameObject.prototype.lootSpawn = function (chest) {
        this.items = [];
        var ammo = new item('ammo', Math.floor(Math.random() * 10));
        var food = new item('food', Math.floor(Math.random() * 5));
        var armour = new item('armour', Math.round(Math.random() * 0.6));
        if (ammo.amount != 0)
            this.items.push(ammo);
        if (food.amount != 0)
            this.items.push(food);
        if (armour.amount != 0)
            this.items.push(armour);
        if (Math.random() >= .99)
            this.items.push(new item('Tekashi 6ix9ine', 69));
        this.updateElements = function () {
            game.elements.lootEl.innerHTML = '';
            this.items.forEach(function (element) {
                var el = document.createElement('span');
                el.className = 'clickable';
                el.addEventListener('click', function () {
                    game.inventory.addItem(element);
                    var i = this.items.indexOf(element);
                    this.items.splice(i, 1);
                    game.inventory.updateElements();
                    this.updateElements();
                });
                el.innerHTML = 'Take';
                game.elements.lootEl.innerHTML += element.amount + ' ' + element.itemName + ' ';
                game.elements.lootEl.appendChild(el);
                game.elements.lootEl.innerHTML += '<br>';
            });
        }
        this.updateElements();
    };

    global.GameObject = new GameObject();

    GameObject.prototype.move = function (direction) {
        if (this.fightingMode == false && this.energy >= 0.4 && this.isTown == false) {
            if (direction == Directions.up) {
                this.currentCell = ((this.currentCell > 24) ? this.currentCell - 25 : this.currentCell);
                this.player.style.transform = 'rotate(0deg)';
            }
            if (direction == Directions.right) {
                this.currentCell = (((this.currentCell + 1) % 25 != 0) ? this.currentCell + 1 : this.currentCell);
            }
            if (direction == Directions.left) {
                this.currentCell = (((this.currentCell + 1) % 25 != 1) ? this.currentCell - 1 : this.currentCell);
                this.player.style.transform = 'rotate(270deg)';
            }
            if (direction == Directions.down) {
                this.currentCell = ((this.currentCell < 600) ? this.currentCell + 25 : this.currentCell);
                this.player.style.transform = 'rotate(180deg)';
            }
            this.player.style.top = qs('#c' + this.currentCell).getBoundingClientRect().y + 'px';
            this.player.style.left = qs('#c' + this.currentCell).getBoundingClientRect().x + 'px';
            this.facing = direction;
            this.steps++;
            this.stepsEl.innerHTML = 'Steps taken: ' + this.steps;
            this.energy -= 0.4;
            this.energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
            this.gameProgression++;
            var currentCellEl = qs('#c' + this.currentCell);
            if (!this.lootArray[this.currentCell])
                this.lootArray[this.currentCell] = new lootSpawn((this.currentCellEl.innerHTML == 'C'));
            var currentLoot = this.lootArray[this.currentCell];

            this.lootAmmo.innerHTML = this.currentLoot.ammo;
            this.lootFood.innerHTML = this.currentLoot.food;
            this.lootAmmoWrap.style.display = ((this.currentLoot.ammo == 0) ? 'none' : 'block');
            this.lootFoodWrap.style.display = ((this.currentLoot.food == 0) ? 'none' : 'block');
            this.lootArray[currentCell].take = this.takeF;
            if (this.currentCellEl.innerHTML == "'")
                this.lootHeading.innerHTML = "[']" + ' Plains';
            if (this.currentCellEl.innerHTML == "*")
                this.lootHeading.innerHTML = "[*]" + ' Forest';
            if (this.currentCellEl.innerHTML == ",")
                this.lootHeading.innerHTML = "[,]" + ' Swamp';
            if (this.currentCellEl.innerHTML == "C")
                this.lootHeading.innerHTML = "[C]" + ' Chest';
            if (this.currentCellEl.innerHTML == "T") {
                this.lootHeading.innerHTML = "[T]" + ' Town';
                this.isTown = true;
            }
            if (this.currentCellEl.innerHTML == " ")
                this.lootHeading.innerHTML = "[ ]" + ' Empty';
            if (Math.random() >= 0.80 && this.fightingMode == false && this.isTown == false) {
                this.saveBoxHTML = this.box.innerHTML;
                this.fightingMode = true;
                this.box.innerHTML = '';
                this.player.style.transform = 'rotate(0deg)';
                this.facing = Directions.up;
                this.player.style.left = 'calc(50% - 10px)';
                this.player.style.left = this.player.getBoundingClientRect().left + 'px';
                this.box.style.transform = 'scale(0.40)';
                this.box.style.borderWidth = '5px';
                this.player.style.top = this.box.offsetHeight - 140 + 'px';
                this.enemy.style.top = this.box.offsetHeight - 300 + 'px';
                this.enemyHealth = this.enemyMaxHealth;
                var that = this;
                setTimeout(function () {
                    var b = that.box.getBoundingClientRect();
                    that.enemy.style.left = that.player.style.left;
                    that.enemyHealthEl.innerHTML = 'Enemy health: ' + that.enemyHealth + '/' + that.enemyMaxHealth;
                    that.fightHealthEl.innerHTML = 'Health: ' + that.health + '/' + that.maxHealth;
                    that.enemyHealthEl.style.left = b.left + 'px';
                    that.enemyHealthEl.style.top = b.top - 15 + 'px';
                    that.enemyHealthEl.style.width = b.width + 'px';
                    that.fightHealthEl.style.left = b.left + 'px';
                    that.fightHealthEl.style.top = b.top + 2 + b.height + 'px';
                    that.fightHealthEl.style.width = b.width + 'px';
                    that.fightHealthEl.style.display = 'block';
                    that.enemyHealthEl.style.display = 'block';
                    that.enemy.style.display = 'block';
                }, 1000);
                enemyDecisionInterval = setInterval(function () {
                    var enemyCoordinates = that.enemy.getBoundingClientRect();
                    if (that.playerIsShooting) {
                        if (that.enemyCoordinates.left + 20 == that.player.getBoundingClientRect().left) {
                            that.enemy.style.left = that.enemyCoordinates.left - 20 + 'px';
                        } else if (that.enemyCoordinates.left - 20 == that.player.getBoundingClientRect().left) {
                            that.enemy.style.left = that.enemyCoordinates.left + 20 + 'px';
                        } else {
                            that.enemy.style.left = that.enemyCoordinates.left + ((Math.random() >= .50) ? 20 : (-20)) + 'px';
                        }
                    } else if (that.enemyCoordinates.left == that.player.getBoundingClientRect().left) {
                        that.enemyShoot();
                        that.enemyCoordinates.left = that.player.getBoundingClientRect().left;
                    } else if (enemyCoordinates.left < that.player.getBoundingClientRect().left) {
                        that.enemy.style.left = that.enemyCoordinates.left + 20 + 'px';
                    } else if (that.enemyCoordinates.left > that.player.getBoundingClientRect().left) {
                        that.enemy.style.left = that.enemyCoordinates.left - 20 + 'px';
                    }
                    if (that.enemyCoordinates.left <= that.box.getBoundingClientRect().left + 12)
                        that.enemy.style.left = that.box.getBoundingClientRect().left + 12 + 'px';
                    that.enemy.style.left = that.box.getBoundingClientRect().left + 172 + 'px';
                    if (that.enemyHealth <= 0)
                        clearInterval(enemyDecisionInterval);
                    that.enemyHealthEl.innerHTML = 'Enemy health: ' + that.enemyHealth + '/' + that.enemyMaxHealth;
                    that.fightHealthEl.innerHTML = 'Health: ' + that.health + '/' + that.maxHealth;
                    that.healthEl.innerHTML = 'Health: ' + that.health + '/' + that.maxHealth;
                }, 320);
            }
            if (this.isTown == true) {
                this.saveBoxHTML = this.box.innerHTML;
                this.box.innerHTML = '';
                var tblt = ['<table><tr>'];
                for (var i = 0; i < 144; i++) {
                    tblt.push("<td id='c" + i + "'style='width:34.614px;height:34.614px;font-size:23.076px;'></td>");
                    if ((i + 1) % 12 == 0)
                        tblt.push('</tr><tr>');
                }
                tblt.push('</tr></table>');
                this.box.innerHTML = tblt.join('');
                this.player.style.transform = 'rotate(0deg)';
                this.facing = Directions.up;
                this.player.style.left = 'calc(50% - 10px)';
                this.player.style.left = this.player.getBoundingClientRect().left + 'px';
                this.box.style.transform = 'scale(0.52)';
                this.box.style.borderWidth = '5px';
                this.player.style.top = this.box.offsetHeight - 140 + 'px';
                this.gameProgression += 5;
            }
        } else if (this.fightingMode == true && this.energy >= 0.4) {
            if (this.direction == Directions.right) {
                this.player.style.left = this.player.getBoundingClientRect().x + 20 + 'px';
            }
            if (this.direction == Directions.left) {
                this.player.style.left = this.player.getBoundingClientRect().x - 20 + 'px';
            }
            if (this.player.getBoundingClientRect().left < this.box.getBoundingClientRect().left + 12)
                this.player.style.left = box.getBoundingClientRect().left + 12 + 'px';
            if (this.player.getBoundingClientRect().left > this.box.getBoundingClientRect().left + 172)
                this.player.style.left = box.getBoundingClientRect().left + 172 + 'px';
            this.steps++;
            this.stepsEl.innerHTML = 'Steps taken: ' + this.steps;
            this.gameProgression++;
        } else if (this.isTown == true && this.energy >= 0.4) {
            if (this.direction == Directions.right) {
                this.player.style.left = this.player.getBoundingClientRect().x + 20 + 'px';
                this.player.style.transform = 'rotate(90deg)';
            }
            if (this.direction == Directions.left) {
                this.player.style.left = this.player.getBoundingClientRect().x - 20 + 'px';
                this.player.style.transform = 'rotate(270deg)';
            }
            if (this.direction == Directions.down) {
                this.player.style.top = this.player.getBoundingClientRect().y + 20 + 'px';
                this.player.style.transform = 'rotate(180deg)';
            }
            if (this.direction == Directions.up) {
                this.player.style.top = this.player.getBoundingClientRect().y - 20 + 'px';
                this.player.style.transform = 'rotate(0deg)';
            }
            if (this.player.getBoundingClientRect().left < this.box.getBoundingClientRect().left + 12)
                this.player.style.left = this.box.getBoundingClientRect().left + 12 + 'px';
            if (this.player.getBoundingClientRect().left > this.box.getBoundingClientRect().left + 172)
                this.player.style.left = this.box.getBoundingClientRect().left + 172 + 'px';
            if (this.player.getBoundingClientRect().y < this.box.getBoundingClientRect().y)
                this.player.style.top = this.box.getBoundingClientRect().top + 'px';
            if (this.player.getBoundingClientRect().y > this.box.getBoundingClientRect().y + 174)
                this.player.style.top = this.box.getBoundingClientRect().top + 174 + 'px';
            this.steps++;
            this.stepsEl.innerHTML = 'Steps taken: ' + this.steps;
            this.gameProgression += 2;
        } else {
            log("You have no energy! Get food fast!");
        }
    }

    document.body.onkeyup = function (e) {
        if (document.activeElement != nameEl) {
            if (e.key == "w" || e.key == "ArrowUp") {
                move(Directions.up);
            }
            else if (e.key == "d" || e.key == "ArrowRight") {
                move(Directions.right);
            }
            else if (e.key == "a" || e.key == "ArrowLeft") {
                move(Directions.left);
            }
            else if (e.key == "s" || e.key == "ArrowDown") {
                move(Directions.down);
            }
            else if (e.key == " ") {
                if (energy >= 0.2) {
                    shoot(facing);
                } else {
                    log("You have no energy! Get food fast!");
                }
            }
            else if (e.key == "e") {
                eat(1);
            }
            else if (e.key == "Escape") {
                if (fightingMode == true && energy >= 3) {
                    setTimeout(function () {
                        fightingMode = false;
                    }, 1500)
                    box.innerHTML = saveBoxHTML;
                    box.style.transform = 'scale(1.0)';
                    box.style.borderWidth = '2px';
                    setTimeout(function () {
                        this.player.style.top = qs('#c' + this.currentCell).getBoundingClientRect().y + 'px';
                        this.player.style.left = qs('#c' + this.currentCell).getBoundingClientRect().x + 'px';
                    }, 1500);
                    energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
                    enemy.style.display = 'none';
                    clearInterval(x);
                    this.playerIsShooting = false;
                    fightHealthEl.style.display = 'none';
                    enemyHealthEl.style.display = 'none';
                    gameProgression += 10;
                    energy -= 3;
                    energyEl.innerHTML = 'Energy' + Math.round(energy) + '/' + maxEnergy;
                } else if (isTown) {
                    setTimeout(function () {
                        fightingMode = false;
                        isTown = false;
                    }, 1500);
                    box.innerHTML = saveBoxHTML;
                    box.style.transform = 'scale(1.0)';
                    box.style.borderWidth = '2px';
                    setTimeout(function () {
                        this.player.style.top = qs('#c' + this.currentCell).getBoundingClientRect().y + 'px';
                        this.player.style.left = qs('#c' + this.currentCell).getBoundingClientRect().x + 'px';
                    }, 1500);
                    enemy.style.display = 'none';
                    clearInterval(x);
                    this.playerIsShooting = false;
                    fightHealthEl.style.display = 'none';
                    enemyHealthEl.style.display = 'none';
                    gameProgression += 10;
                    energy -= 3;
                    energyEl.innerHTML = 'Energy' + Math.round(energy) + '/' + maxEnergy;
                    isTown = false;
                    saveGame();
                }
                isTown = false;
                clearInterval(enemyDecisionInterval);
            } else if (e.key == 'Enter') {
                if ($('#startscreen').html() != '') {
                    regenDegenInterval = setInterval(function () {
                        if (Math.round(energy) > 0 && health == maxHealth)
                            energy--;
                        if (energy > maxEnergy)
                            energy = maxEnergy;
                        if (Math.round(energy) == maxEnergy && health < maxHealth) {
                            energy = maxEnergy;
                            health += 3;
                        }
                        if (Math.round(energy) == 0) {
                            health -= Math.floor(maxHealth / 3);
                            healthEl.innerHTML = 'Health: ' + health + '/' + maxHealth;
                            log('You have no energy! Get food fast!');
                        }
                        if (health < 0) {
                            var saveHTML = document.body.innerHTML;
                            document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 3</span></p>"
                            setTimeout(function () {
                                document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 2</span></p>"
                            }, 1000);
                            setTimeout(function () {
                                document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 1</span></p>"
                            }, 2000);
                            setTimeout(function () {
                                health = maxHealth;
                                energy = maxEnergy;
                                ammo = 100;
                                food = 100;
                                fightingMode = false;
                                isTown = false;
                                saveGame();
                                location.reload();
                            }, 3000);
                        }
                        if (health > maxHealth)
                            health = maxHealth;
                        energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
                        healthEl.innerHTML = 'Health: ' + health + '/' + maxHealth;
                        saveGame();
                    }, 5000);
                    $('#startscreen').html('');
                    $('#startscreen').css('display', 'none');
                }
            }
        }
    }
    if ($('startscreen').html != '') {
        game.playEl.addEventListener('click', function () {
            regenDegenInterval = setInterval(function () {
                if (Math.round(energy) > 0 && health == maxHealth)
                    energy--;
                if (energy > maxEnergy)
                    energy = maxEnergy;
                if (Math.round(energy) == maxEnergy && health < maxHealth) {
                    energy = maxEnergy;
                    health += 3;
                }
                if (Math.round(energy) == 0) {
                    health -= Math.floor(maxHealth / 3);
                    healthEl.innerHTML = 'Health: ' + health + '/' + maxHealth;
                    log('You have no energy! Get food fast!');
                }
                if (health < 0) {
                    var saveHTML = document.body.innerHTML;
                    document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 3</span></p>"
                    setTimeout(function () {
                        document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 2</span></p>"
                    }, 1000);
                    setTimeout(function () {
                        document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 1</span></p>"
                    }, 2000);
                    setTimeout(function () {
                        energy = maxEnergy;
                        health = maxHealth;
                        location.reload();
                    }, 3000);
                }
                if (health > maxHealth)
                    health = maxHealth;
                energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
                healthEl.innerHTML = 'Health: ' + health + '/' + maxHealth;
            }, 5000);
            $('#startscreen').html('');
            $('#startscreen').css('display', 'none');
        });
    }
    /*if (getCookie('map') == "") {
        var mapHTML;
        var textRows = generatedMap.match(/.{1,25}/g);
        for (var j = 0; j < 25; j += 2) {
            textRows[j] = textRows[j].split('').reverse().join('');
        }
        mapHTML = '<td>' + textRows.join('').split('').join('</td><td>') + '</td>';
        mapHTML = '<table><tr>' + mapHTML.match(/.{1,250}/g).join('</tr><tr>') + '</tr></table>';
        setCookie('map', generatedMap, 100);
    } else {
        mapHTML = getCookie('map');
        mapHTML = '<td>' + textRows.join('').split('').join('</td><td>') + '</td>';
        mapHTML = '<table><tr>' + mapHTML.match(/.{1,250}/g).join('</tr><tr>') + '</tr></table>';
        setCookie('map', generatedMap, 100);
    }
    box.innerHTML = mapHTML;
    document.querySelectorAll('td').forEach(function (element, index) {
        element.id = 'c' + index;
    });*/

    if (game.lootArray[currentCell] == undefined)
        game.lootArray[currentCell] = new lootSpawn((qs('#c' + this.currentCell).innerHTML == 'C'));
    game.lootArray[currentCell].take = takeF;
    if (game.lootArray[currentCell] == undefined)
        game.lootArray[currentCell] = new lootSpawn((qs('#c' + this.currentCell).innerHTML == 'C'));
    game.lootAmmo.innerHTML = game.lootArray[currentCell].ammo;
    game.lootFood.innerHTML = game.lootArray[currentCell].food;
    game.lootAmmoWrap.style.display = ((game.lootArray[currentCell].ammo == 0) ? 'none' : 'block');
    game.lootFoodWrap.style.display = ((game.lootArray[currentCell].food == 0) ? 'none' : 'block');

    var cc = qs('#c' + this.currentCell);

    this.player.style.top = cc.getBoundingClientRect().y + 'px';
    this.player.style.left = cc.getBoundingClientRect().x + 'px';


    function shoot(direction) {
        if (ammo > 0) {
            var bullet = document.createElement('div');
            bullet.className = 'bullet';
            bullet.innerHTML = "<img src='bullet.png' height='18px' width='18px'>"
            bullet.style.top = this.player.getBoundingClientRect().y + 'px';
            bullet.style.left = this.player.getBoundingClientRect().x + 'px';
            this.playerX = this.player.getBoundingClientRect().x;
            this.playerY = this.player.getBoundingClientRect().y;
            document.body.appendChild(bullet);
            var i = 0;
            var x = setInterval(function () {
                if (direction == Directions.up) {
                    bullet.style.top = this.playerY - i + 'px';
                } else if (direction == Directions.right) {
                    bullet.style.left = this.playerX + i + 'px';
                } else if (direction == Directions.left) {
                    bullet.style.left = this.playerX - i + 'px';
                } else if (direction == Directions.down) {
                    bullet.style.top = this.playerY + i + 'px';
                }
                i += 10;
                this.playerIsShooting = true;
                if (detectHit(bullet, enemy) == true) {
                    console.log('yay!');
                    clearInterval(x);
                    bullet.parentNode.removeChild(bullet);
                    enemyHealth--;
                    gameProgression += 3;
                    if (enemyHealth <= 0) {
                        setTimeout(function () {
                            fightingMode = false;
                        }, 1500)
                        box.innerHTML = saveBoxHTML;
                        box.style.transform = 'scale(1.0)';
                        box.style.borderWidth = '2px';
                        setTimeout(function () {
                            this.player.style.top = qs('#c' + this.currentCell).getBoundingClientRect().y + 'px';
                            this.player.style.left = qs('#c' + this.currentCell).getBoundingClientRect().x + 'px';
                        }, 1500);
                        energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
                        enemy.style.display = 'none';
                        clearInterval(x);
                        this.playerIsShooting = false;
                        fightHealthEl.style.display = 'none';
                        enemyHealthEl.style.display = 'none';
                        gameProgression += 100;
                        saveGame();
                    }
                }
            }, 33);
            ammo--;
            ammoUsed++;
            ammoEl.innerHTML = 'Ammo: ' + ammo;
            ammoUsedEl.innerHTML = 'Ammo used: ' + ammoUsed;
            energy -= 0.2;
            energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
            gameProgression += 0.2;
            setTimeout(function () {
                clearInterval(x);
                this.playerIsShooting = false;
                if (bullet.parentNode != null) {
                    bullet.parentNode.removeChild(bullet);
                }
            }, 600);
        } else {
            log('Out of ammo! Reload.');
        }
    }

    function enemyShoot() {
        var bullet = document.createElement('div');
        bullet.className = 'bullet';
        bullet.innerHTML = "<img src='bullet.png' height='18px' width='18px'>"
        bullet.style.top = enemy.getBoundingClientRect().y + 'px';
        bullet.style.left = enemy.getBoundingClientRect().x + 'px';
        var enemyX = enemy.getBoundingClientRect().x;
        var enemyY = enemy.getBoundingClientRect().y;
        document.body.appendChild(bullet);
        var i = 0;
        var x = setInterval(function () {
            bullet.style.top = enemyY + i + 'px';
            i += 10;
            if (detectHit(bullet, this.player)) {
                console.log('boo!');
                bullet.parentNode.removeChild(bullet);
                health--;
                if (health <= 0) {
                    setTimeout(function () {
                        fightingMode = false;
                    }, 1500)
                    box.innerHTML = saveBoxHTML;
                    box.style.transform = 'scale(1.0)';
                    box.style.borderWidth = '2px';
                    energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
                    enemy.style.display = 'none';
                    clearInterval(x);
                    this.playerIsShooting = false;
                    fightHealthEl.style.display = 'none';
                    enemyHealthEl.style.display = 'none';
                    setTimeout(function () {
                        this.player.style.top = qs('#c' + this.currentCell).getBoundingClientRect().y + 'px';
                        this.player.style.left = qs('#c' + this.currentCell).getBoundingClientRect().x + 'px';
                    }, 1500);
                    energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
                    enemy.style.display = 'none';
                    clearInterval(x);
                    document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 3</span></p>"
                    setTimeout(function () {
                        document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 2</span></p>"
                    }, 1000);
                    setTimeout(function () {
                        document.body.innerHTML = "<p style='font-size: 100px; position: absolute; top: 0; height: 100%; width: 100%; text-align: center;'>YOU DIED<br><span style='font-size: 20px;'>respawning in: 1</span></p>"
                    }, 2000);
                    setTimeout(function () {
                        energy = maxEnergy;
                        health = maxHealth;
                        ammo = 100;
                        food = 10;
                        location.reload();
                    }, 3000);
                }
                health.innerHTML = 'Health: ' + health + '/' + maxHealth;
                clearInterval(x);
            }
            health.innerHTML = 'Health: ' + health + '/' + maxHealth;
        }, 33);
        setTimeout(function () {
            clearInterval(x);
            if (bullet.parentNode != null) {
                bullet.parentNode.removeChild(bullet);
            }
        }, 600);
    }

    function log(message) {
        logEl.innerHTML = message + '<br>' + logEl.innerHTML;
    }

    setInterval(function () {
        name = nameEl.innerHTML;
    }, 1000)

    function eat(amount) {
        if (energy < maxEnergy && food >= amount) {
            food -= amount;
            energy += amount * 3;
            if (energy > maxEnergy)
                energy = maxEnergy;
            foodEl.innerHTML = 'Food: ' + food + ' [E to eat]';
            energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
        } else if (energy < maxEnergy && food < amount) {
            log('You have no food!')
        } else if (energy = maxEnergy) {
            log("Your energy is full. No need to eat.");
        }
    }

    var cc2 = qs('#c' + this.currentCell);
    var lh = qs('#loot-heading');
    if (cc2) {
        if (cc2.innerHTML == "'")
            lh.innerHTML = "[']" + ' Plains';
        if (cc2.innerHTML == "*")
            lh.innerHTML = "[*]" + ' Forest';
        if (cc2.innerHTML == ",")
            lh.innerHTML = "[,]" + ' Swamp';
        if (cc2.innerHTML == "C")
            lh.innerHTML = "[C]" + ' Chest';
        if (cc2.innerHTML == " ")
            lh.innerHTML = "[ ]" + ' Empty';
        if (cc2.innerHTML == "[L]")
            lh.innerHTML == "[L]" + 'Lake';
        if (cc2.innerHTML == "[M]")
            lh.innerHTML == "[M]" + 'Mountain';
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function checkCookie() {
        var checker = getCookie('checker');
        if (checker == "yup") {
            /*name = getCookie('name');
            health = Number(getCookie('health'));
            maxHealth = Number(getCookie('maxhealth'));
            ammo = Number(getCookie('ammo'));
            energy = Number(getCookie('energy'));
            maxEnergy = Number(getCookie('maxenergy'));
            food = Number(getCookie('food'));
            steps = Number(getCookie('steps'));
            ammoUsed = Number(getCookie('ammoused'));
            lootArray = JSON.parse(getCookie('loot'));
            gameProgression = Number(getCookie('gameprogression'));
            noise.seed(getCookie('seed'));*/
            //saveFile = getCookie('saveFile');
        } /*else {
            setCookie('loot', JSON.stringify(lootArray), 30);
        }*/
    }

    checkCookie();

    function saveGame() {
        saveFile = JSON.stringify(global._exp_game);
        saveFile = JSON.stringify([worldSeed, health, maxHealth, energy, maxEnergy, ammo, food, this.currentCell,
            gameProgression, isTown, fightingMode]);
        game.lootArray.forEach(function (element, index) {
            if (element != null) {
                saveFile = saveFile + index + '|' + element.ammo + '|' + element.food + ',';
            }
        });
        saveFile = saveFile.slice(0, -1);
        saveFile = window.btoa(saveFile);
    }

    function readSaveFile() {
        if (saveFile != '') {
            var decodedSaveFile = window.atob(saveFile);
            var split = decodedSaveFile.split('#');
            var loot = [];
            split[10].split(',').forEach(function (element) {
                var x = element.split('|');
                loot[Number(x[0])] = {
                    ammo: Number(x[1]),
                    food: Number(x[2]),
                    take: takeF
                };
            });
            return {
                seed: Number(split[0]),
                health: Number(split[1]),
                maxHealth: Number(split[2]),
                energy: Number(split[3]),
                maxEnergy: Number(split[4]),
                ammo: Number(split[5]),
                food: Number(split[6]),
                currentCell: Number(split[7]),
                gameProgression: Number(split[8]),
                isTown: (split[9] == 'true'),
                fightingMode: (split[10] == 'true'),
                lootArray: loot
            };
        }
    }

    /*function initFromSave() {
        var r = readSaveFile();
        noise.seed(r.seed);
        health = r.health;
        maxHealth = r.maxHealth;
        energy = r.energy;
        maxEnergy = r.maxEnergy;
        ammo = r.ammo;
        food = r.food;
        this.currentCell = r.currentCell;
        gameProgression = r.gameProgression;
        isTown = r.isTown;
        fightingMode = r.fightingMode;
        lootArray = r.lootArray;
    }*/

    saveGame();

    if (readSaveFile != '')
        initFromSave();


    if (game.lootArray[currentCell] == undefined)
        game.lootArray[currentCell] = new lootSpawn((qs('#c' + this.currentCell).innerHTML == 'C'));
    game.lootArray[currentCell].take = takeF;

    game.nameEl.innerHTML = game.name;
    game.healthEl.innerHTML = 'Health: ' + game.health + '/' + game.maxHealth;
    game.energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + game.maxEnergy;
    game.ammoEl.innerHTML = 'Ammo: ' + game.ammo;
    game.foodEl.innerHTML = 'Food: ' + game.food + ' [E to eat]';
    game.ammoUsedEl.innerHTML = 'Ammo used: ' + game.ammoUsed;
    game.stepsEl.innerHTML = 'Steps taken: ' + game.steps;
    qs('#log-heading').innerHTML = 'Log';
    game.lootAmmo.innerHTML = game.lootArray[game.currentCell].ammo;
    game.lootFood.innerHTML = game.lootArray[game.currentCell].food;
    game.lootAmmoWrap.style.display = ((game.lootArray[game.currentCell].ammo == 0) ? 'none' : 'block');
    game.lootFoodWrap.style.display = ((game.lootArray[game.currentCell].food == 0) ? 'none' : 'block');
    game.lootArray[game.currentCell].take = game.takeF;
    game.logEl.innerHTML = 'You awake into a strange world.';
    setTimeout(function () {
        log('Your memories are a messy blur.')
    }, 1500);
    setTimeout(function () {
        log('Distant flashbacks of the battlefield swirl through your mind.')
    }, 3000);

    var count = 1;

    function glitchInterval() {
        setTimeout(function () {
            var savePlayerCoordinates = this.player.getBoundingClientRect();
            $('html').css({ 'position': 'absolute', 'left': '89px' });
            setTimeout(function () { $('html').css('transform', 'scale(1.2), rotate(180deg)') }, 100);
            setTimeout(function () { $('html').css({ 'filter': 'invert(1)', 'left': '0' }) }, 150);
            setTimeout(function () {
                $('html').css({ 'filter': 'none', 'transform': 'none', 'position': 'relative' });
                this.player.style.left = savePlayerCoordinates.left + 'px';
                this.player.style.top = savePlayerCoordinates.top + 'px';
            }, 200);
            count++;
        }, (10000000 / gameProgression) * count);
    }

    glitchInterval();

    $('#hugeheading').mgGlitch({
        // set 'true' to stop the plugin
        destroy: false,
        // set 'false' to stop glitching
        glitch: true,
        // set 'false' to stop scaling
        scale: true,
        // set 'false' to stop glitch blending
        blend: true,
        // select blend mode type
        blendModeType: 'hue',
        // set min time for glitch 1 elem
        glitch1TimeMin: 100,
        // set max time for glitch 1 elem
        glitch1TimeMax: 500,
    });

    $('#by2kinc').css({ 'clip': 'unset', 'left': '0' });

    noise.seed(readSaveFile().seed);

    for (var x = 0; x < 2500; x += 100) {
        for (var y = 0; y < 2500; y += 100) {
            var value = Math.abs(noise.perlin2(x / 10000, y / 10000));
            value *= 3;

            if (value >= 0.75) {
                value = " ";
            } else if (value >= 0.45) {
                value = ",";
            } else if (value >= 0.25) {
                value = "'";
            } else if (value >= 0) {
                value = "*";
            } else {
                value = '.';
            }
            var cell = Math.floor(((x + y * 25) / 100) - 3);
            if (cell < 0)
                cell = 0;

            tds[cell].innerHTML = value;
            if (cell < tds.length - 1) tds[cell + 1].innerHTML = value;
            if (cell < tds.length - 2) tds[cell + 2].innerHTML = value;
            tds[cell].innerHTML = value;
            if (cell < tds.length - 3) tds[cell + 3].innerHTML = value;
        }
    }

    for (var i = 0; i < 625; i++) {
        var randomNum = (pi[worldSeed + i] + pi[worldSeed + i + 1] + pi[worldSeed + i + 2]) / 3;
        if (randomNum >= 8.5) {
            document.querySelectorAll('td')[i].innerHTML = 'C';
        } else if (randomNum <= 1. && randomNum > 0.15) {
            document.querySelectorAll('td')[i].innerHTML = 'T';
        } else if (randomNum == 0) {
            document.querySelectorAll('td')[i].innerHTML = 'L';
        }
    }

    function town(index) {
        var possibleDirections = ['North', 'East', 'South', 'West'];
        this.townHall = possibleDirections[pi[worldSeed + index] % 4];
        this.pathLengths = [pi[worldSeed + index + 1] % 3 + 2, pi[worldSeed + index + 2] % 3 + 2,
        pi[worldSeed + index + 3] % 3 + 2];
        this.index = index;
    }

    console.log(new town(1));

    this.currentCellEl = qs('#c' + this.currentCell);
    if (lootArray[currentCell] == undefined)
        lootArray[currentCell] = new lootSpawn((this.currentCellEl.innerHTML == 'C'));
    var currentLoot = lootArray[currentCell];

    lootAmmo.innerHTML = currentLoot.ammo;
    lootFood.innerHTML = currentLoot.food;
    lootAmmoWrap.style.display = ((currentLoot.ammo == 0) ? 'none' : 'block');
    lootFoodWrap.style.display = ((currentLoot.food == 0) ? 'none' : 'block');
    lootArray[currentCell].take = takeF;
    if (this.currentCellEl.innerHTML == "'")
        lootHeading.innerHTML = "[']" + ' Plains';
    if (this.currentCellEl.innerHTML == "*")
        lootHeading.innerHTML = "[*]" + ' Forest';
    if (this.currentCellEl.innerHTML == ",")
        lootHeading.innerHTML = "[,]" + ' Swamp';
    if (this.currentCellEl.innerHTML == "C")
        lootHeading.innerHTML = "[C]" + ' Chest';
    if (this.currentCellEl.innerHTML == "T") {
        lootHeading.innerHTML = "[T]" + ' Town';
        isTown = true;
    }
    if (this.currentCellEl.innerHTML == "L")
        lootHeading.innerHTML = "[L]" + ' Lake';
    if (this.currentCellEl.innerHTML == "M")
        lootHeading.innerHTML = "[M]" + ' Mountain';

    if (this.currentCellEl.innerHTML == " ") {
        lootHeading.innerHTML = "[ ]" + ' Empty';
    }

    setInterval(function () {
        saveGame();
        initFromSave();
    }, 3000);
    document.querySelector('#loading').style.display = 'none';
})(this);
