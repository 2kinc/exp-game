(function (global) {
    var qs = function (selector) {
        return document.querySelector(selector);
    };
    var player = qs('#player');
    var box = qs('#box');
    var logEl = qs('#log');
    var currentCell = 312;
    var facing = 'up';
    var ammo = 100;
    var health = 10;
    var maxHealth = 10;
    var steps = 0;
    var energy = 15;
    var ammoUsed = 0;
    var name = 'Default Noob';
    var lootArray = [];
    var food = 10;
    var maxEnergy = 15;
    var foodEl = qs('#food');
    var lootEl = qs('#loot');
    var nameEl = qs('#name');
    var ammoEl = qs('#ammo');
    var healthEl = qs('#health');
    var energyEl = qs('#energy')
    var ammoUsedEl = qs('#ammo-used');
    var stepsEl = qs('#steps-taken');
    var generatedMap;
    var ammoTakes = qs('#ammotakes');
    var foodTakes = qs('#foodtakes');
    var lootAmmo = qs('#lootammonum');
    var lootFood = qs('#lootfoodnum');
    var lootArmour = qs('#lootarmournum');
    var lootAmmoWrap = qs('#lootammo');
    var lootFoodWrap = qs('#lootfood');
    var lootArmourWrap = qs('#lootarmour');
    var fightingMode = false;
    var saveBoxHTML;
    var playerFightingOrigin;
    var enemy = qs('#enemy');
    var enemyMaxHealth = 10;
    var enemyHealth = enemyMaxHealth;
    var playerIsShooting = false;
    var enemyDecisionInterval;
    var fightHealthEl = qs('#fight-health');
    var enemyHealthEl = qs('#enemy-health');
    var gameProgression = 0;
    var regenDegenInterval;
    var isTown = false;
    var armour = false;
    var lootHeading = qs('#loot-heading');
    var playEl = qs("#play_button");
    var saveFile;
    function detectHit(bulletEl, target) {
        if (bulletEl.getBoundingClientRect().top <= target.getBoundingClientRect().top + 20
            && bulletEl.getBoundingClientRect().top >= target.getBoundingClientRect().top - 20
            && target.style.display != 'none'
            && bulletEl.getBoundingClientRect().left >= target.getBoundingClientRect().left - 20
            && bulletEl.getBoundingClientRect().left <= target.getBoundingClientRect().left + 20) {
            return true;
        } else {
            return false;
        }
    };

    var takeF = function (item, amount) {
        if (item == 'ammo') {
            if (amount == 'all') {
                ammo += lootArray[currentCell].ammo;
                lootArray[currentCell].ammo = 0;
            } else {
                lootArray[currentCell].ammo--;
                ammo++;
            }
        }
        if (item == 'food') {
            if (amount == 'all') {
                food += lootArray[currentCell].food;
                lootArray[currentCell].food = 0;
            } else {
                lootArray[currentCell].food--;
                food++;
            }
        }
        ammoEl.innerHTML = 'Ammo: ' + ammo;
        foodEl.innerHTML = 'Food: ' + food + ' [E to eat]';
        lootAmmo.innerHTML = lootArray[currentCell].ammo;
        lootFood.innerHTML = lootArray[currentCell].food;
        lootAmmoWrap.style.display = ((lootArray[currentCell].ammo == 0) ? 'none' : 'block');
        lootFoodWrap.style.display = ((lootArray[currentCell].food == 0) ? 'none' : 'block');
        setCookie('loot', JSON.stringify(lootArray));
        setCookie('food', food, 30);
        setCookie('ammo', ammo, 30);
    };

    setCookie('maxhealth', maxHealth, 30);

    var tbl = ['<table><tr>'];

    for (var i = 0; i < 625; i++) {
        tbl.push("<td id='c" + i + "'></td>");
        if ((i + 1) % 25 == 0)
            tbl.push('</tr><tr>');
    }

    tbl.push('</tr></table>');
    box.innerHTML = tbl.join('');

    var tds = document.querySelectorAll('td');

    setCookie('map', generatedMap, 100);

    checkCookie();

    if (saveFile != '') {
        
    }

    setCookie('maxenergy', maxEnergy);
    setCookie('loot', JSON.stringify(lootArray), 30);
    if (gameProgression == '')
        gameProgression = 0;
    setCookie('gameprogression', gameProgression, 30);


    function lootSpawn(chest) {
        this.ammo = Math.floor(Math.random() * 10);
        this.food = Math.floor(Math.random() * 5);
        if (chest) {
            this.ammo++;
            this.food++;
            this.ammo *= 3;
            this.food *= 3;
        }
        setCookie('loot', JSON.stringify(lootArray));
    }

    function move(direction) {
        if (fightingMode == false && energy >= 0.4 && isTown == false) {
            if (direction == 'up') {
                currentCell = ((currentCell > 24) ? currentCell - 25 : currentCell);
                player.style.transform = 'rotate(0deg)';
            }
            if (direction == 'right') {
                currentCell = (((currentCell + 1) % 25 != 0) ? currentCell + 1 : currentCell);
                player.style.transform = 'rotate(90deg)';
            }
            if (direction == 'left') {
                currentCell = (((currentCell + 1) % 25 != 1) ? currentCell - 1 : currentCell);
                player.style.transform = 'rotate(270deg)';
            }
            if (direction == 'down') {
                currentCell = ((currentCell < 600) ? currentCell + 25 : currentCell);
                player.style.transform = 'rotate(180deg)';
            }
            player.style.top = qs('#c' + currentCell).getBoundingClientRect().y + 'px';
            player.style.left = qs('#c' + currentCell).getBoundingClientRect().x + 'px';
            facing = direction;
            steps++;
            stepsEl.innerHTML = 'Steps taken: ' + steps;
            setCookie('steps', steps, 30);
            energy -= 0.4;
            energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
            setCookie('energy', energy, 30);
            setCookie('maxenergy', maxEnergy, 30);
            gameProgression++;
            setCookie('gameprogression', gameProgression, 30);
            var currentCellEl = qs('#c' + currentCell);
            if (lootArray[currentCell] == undefined)
                lootArray[currentCell] = new lootSpawn((currentCellEl.innerHTML == 'C'));
            setCookie('loot', JSON.stringify(lootArray));
            var currentLoot = lootArray[currentCell];

            lootAmmo.innerHTML = currentLoot.ammo;
            lootFood.innerHTML = currentLoot.food;
            lootAmmoWrap.style.display = ((currentLoot.ammo == 0) ? 'none' : 'block');
            lootFoodWrap.style.display = ((currentLoot.food == 0) ? 'none' : 'block');
            lootArray[currentCell].take = takeF;
            if (currentCellEl.innerHTML == "'")
                lootHeading.innerHTML = "[']" + ' Plains';
            if (currentCellEl.innerHTML == "*")
                lootHeading.innerHTML = "[*]" + ' Forest';
            if (currentCellEl.innerHTML == ",")
                lootHeading.innerHTML = "[,]" + ' Swamp';
            if (currentCellEl.innerHTML == "C")
                lootHeading.innerHTML = "[C]" + ' Chest';
            if (currentCellEl.innerHTML == "T") {
                lootHeading.innerHTML = "[T]" + ' Town';
                isTown = true;
            }
            if (currentCellEl.innerHTML == " ")
                lootHeading.innerHTML = "[ ]" + ' Empty';
            if (Math.random() >= 0.80 && fightingMode == false && isTown == false) {
                saveBoxHTML = box.innerHTML;
                fightingMode = true;
                box.innerHTML = '';
                player.style.transform = 'rotate(0deg)';
                facing = 'up';
                player.style.left = 'calc(50% - 10px)';
                player.style.left = player.getBoundingClientRect().left + 'px';
                box.style.transform = 'scale(0.40)';
                box.style.borderWidth = '5px';
                player.style.top = box.offsetHeight - 140 + 'px';
                enemy.style.top = box.offsetHeight - 300 + 'px';
                enemyHealth = enemyMaxHealth;
                setTimeout(function () {
                    enemy.style.left = player.style.left;
                    enemyHealthEl.innerHTML = 'Enemy health: ' + enemyHealth + '/' + enemyMaxHealth;
                    fightHealthEl.innerHTML = 'Health: ' + health + '/' + maxHealth;
                    enemyHealthEl.style.left = box.getBoundingClientRect().left + 'px';
                    enemyHealthEl.style.top = box.getBoundingClientRect().top - 15 + 'px';
                    enemyHealthEl.style.width = box.getBoundingClientRect().width + 'px';
                    fightHealthEl.style.left = box.getBoundingClientRect().left + 'px';
                    fightHealthEl.style.top = box.getBoundingClientRect().top + 2 + box.getBoundingClientRect().height + 'px';
                    fightHealthEl.style.width = box.getBoundingClientRect().width + 'px';
                    fightHealthEl.style.display = 'block';
                    enemyHealthEl.style.display = 'block';
                    enemy.style.display = 'block';
                }, 1000);
                enemyDecisionInterval = setInterval(function () {
                    var enemyCoordinates = enemy.getBoundingClientRect();
                    if (playerIsShooting) {
                        if (enemyCoordinates.left + 20 == player.getBoundingClientRect().left) {
                            enemy.style.left = enemyCoordinates.left - 20 + 'px';
                        } else if (enemyCoordinates.left - 20 == player.getBoundingClientRect().left) {
                            enemy.style.left = enemyCoordinates.left + 20 + 'px';
                        } else {
                            enemy.style.left = enemyCoordinates.left + ((Math.random() >= .50) ? 20 : (-20)) + 'px';
                        }
                    } else if (enemyCoordinates.left == player.getBoundingClientRect().left) {
                        enemyShoot();
                        enemyCoordinates.left = player.getBoundingClientRect().left;
                    } else if (enemyCoordinates.left < player.getBoundingClientRect().left) {
                        enemy.style.left = enemyCoordinates.left + 20 + 'px';
                    } else if (enemyCoordinates.left > player.getBoundingClientRect().left) {
                        enemy.style.left = enemyCoordinates.left - 20 + 'px';
                    }
                    if (enemyCoordinates.left <= box.getBoundingClientRect().left + 12)
                        enemy.style.left = box.getBoundingClientRect().left + 12 + 'px';
                        enemy.style.left = box.getBoundingClientRect().left + 172 + 'px';
                    if (enemyHealth <= 0)
                        clearInterval(enemyDecisionInterval);
                    enemyHealthEl.innerHTML = 'Enemy health: ' + enemyHealth + '/' + enemyMaxHealth;
                    fightHealthEl.innerHTML = 'Health: ' + health + '/' + maxHealth;
                    healthEl.innerHTML = 'Health: ' + health + '/' + maxHealth;
                }, 320);
            }
            if (isTown == true) {
                saveBoxHTML = box.innerHTML;
                box.innerHTML = '';
                var tblt = ['<table><tr>'];
                for (var i = 0; i < 144; i++) {
                    tblt.push("<td id='c" + i + "'style='width:34.614px;height:34.614px;font-size:23.076px;'></td>");
                    if ((i + 1) % 12 == 0)
                        tblt.push('</tr><tr>');
                }
                tblt.push('</tr></table>');
                box.innerHTML = tblt.join('');
                player.style.transform = 'rotate(0deg)';
                facing = 'up';
                player.style.left = 'calc(50% - 10px)';
                player.style.left = player.getBoundingClientRect().left + 'px';
                box.style.transform = 'scale(0.52)';
                box.style.borderWidth = '5px';
                player.style.top = box.offsetHeight - 140 + 'px';
                gameProgression += 5;
                setCookie('gameprogression', gameProgression, 30);
            }
        } else if (fightingMode == true && energy >= 0.4) {
            if (direction == 'right') {
                player.style.left = player.getBoundingClientRect().x + 20 + 'px';
            }
            if (direction == 'left') {
                player.style.left = player.getBoundingClientRect().x - 20 + 'px';
            }
            if (player.getBoundingClientRect().left < box.getBoundingClientRect().left + 12)
                player.style.left = box.getBoundingClientRect().left + 12 + 'px';
            if (player.getBoundingClientRect().left > box.getBoundingClientRect().left + 172)
                player.style.left = box.getBoundingClientRect().left + 172 + 'px';
            steps++;
            stepsEl.innerHTML = 'Steps taken: ' + steps;
            setCookie('steps', steps, 30);
            gameProgression++;
            setCookie('gameprogression', gameProgression, 30);
        } else if (isTown == true && energy >= 0.4) {
            if (direction == 'right') {
                player.style.left = player.getBoundingClientRect().x + 20 + 'px';
                player.style.transform = 'rotate(90deg)';
            }
            if (direction == 'left') {
                player.style.left = player.getBoundingClientRect().x - 20 + 'px';
                player.style.transform = 'rotate(270deg)';
            }
            if (direction == 'down') {
                player.style.top = player.getBoundingClientRect().y + 20 + 'px';
                player.style.transform = 'rotate(180deg)';
            }
            if (direction == 'up') {
                player.style.top = player.getBoundingClientRect().y - 20 + 'px';
                player.style.transform = 'rotate(0deg)';
            }
            if (player.getBoundingClientRect().left < box.getBoundingClientRect().left + 12)
                player.style.left = box.getBoundingClientRect().left + 12 + 'px';
            if (player.getBoundingClientRect().left > box.getBoundingClientRect().left + 172)
                player.style.left = box.getBoundingClientRect().left + 172 + 'px';
            if (player.getBoundingClientRect().y < box.getBoundingClientRect().y)
                player.style.top = box.getBoundingClientRect().top + 'px';
            if (player.getBoundingClientRect().y > box.getBoundingClientRect().y + 174)
                player.style.top = box.getBoundingClientRect().top + 174 + 'px';
            steps++;
            stepsEl.innerHTML = 'Steps taken: ' + steps;
            setCookie('steps', steps, 30);
            gameProgression += 2;
            setCookie('gameprogression', gameProgression, 30);
        } else {
            log("You have no energy! Get food fast!");
        }
    }

    document.body.onkeyup = function (e) {
        if (document.activeElement != nameEl) {
            if (e.key == "w" || e.key == "ArrowUp") {
                move('up');
            }
            else if (e.key == "d" || e.key == "ArrowRight") {
                move('right');
            }
            else if (e.key == "a" || e.key == "ArrowLeft") {
                move('left');
            }
            else if (e.key == "s" || e.key == "ArrowDown") {
                move('down');
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
                        player.style.top = qs('#c' + currentCell).getBoundingClientRect().y + 'px';
                        player.style.left = qs('#c' + currentCell).getBoundingClientRect().x + 'px';
                    }, 1500);
                    setCookie('energy', energy, 30);
                    energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
                    enemy.style.display = 'none';
                    clearInterval(x);
                    playerIsShooting = false;
                    fightHealthEl.style.display = 'none';
                    enemyHealthEl.style.display = 'none';
                    gameProgression += 10;
                    setCookie('gameprogression', gameProgression, 30);
                    energy -= 3;
                    setCookie('energy', energy, 30);
                    energyEl.innerHTML = 'Energy' + energy + '/' + maxEnergy;
                } else if (isTown) {
                    setTimeout(function () {
                        fightingMode = false;
                        isTown = false;
                    }, 1500);
                    box.innerHTML = saveBoxHTML;
                    box.style.transform = 'scale(1.0)';
                    box.style.borderWidth = '2px';
                    setTimeout(function () {
                        player.style.top = qs('#c' + currentCell).getBoundingClientRect().y + 'px';
                        player.style.left = qs('#c' + currentCell).getBoundingClientRect().x + 'px';
                    }, 1500);
                    setCookie('energy', energy, 30);
                    energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
                    enemy.style.display = 'none';
                    clearInterval(x);
                    playerIsShooting = false;
                    fightHealthEl.style.display = 'none';
                    enemyHealthEl.style.display = 'none';
                    gameProgression += 10;
                    setCookie('gameprogression', gameProgression, 30);
                    energy -= 3;
                    setCookie('energy', energy, 30);
                    energyEl.innerHTML = 'Energy' + Math.round(energy) + '/' + maxEnergy;
                    isTown = false;
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
                                energy = maxEnergy;
                                health = maxHealth;
                                setCookie('energy', energy);
                                setCookie('health', health);
                                setCookie('ammo', ammo, 60);
                                setCookie('food', food, 30);
                                location.reload();
                            }, 3000);
                        }
                        if (health > maxHealth)
                            health = maxHealth;
                        energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
                        healthEl.innerHTML = 'Health: ' + health + '/' + maxHealth;
                        setCookie('energy', energy);
                        setCookie('health', health);
                    }, 5000);
                    $('#startscreen').html('');
                    $('#startscreen').css('display', 'none');
                }
            }
        }
    }
    if ($('startscreen').html != '') {
        playEl.addEventListener('click', function () {
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
                        setCookie('energy', energy);
                        setCookie('health', health);
                        setCookie('ammo', ammo, 30);
                        setCookie('food', food, 30);
                        location.reload();
                    }, 3000);
                }
                if (health > maxHealth)
                    health = maxHealth;
                energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
                healthEl.innerHTML = 'Health: ' + health + '/' + maxHealth;
                setCookie('energy', energy);
                setCookie('health', health);
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

    if (lootArray[currentCell] == undefined)
        lootArray[currentCell] = new lootSpawn((qs('#c' + currentCell).innerHTML == 'C'));
    setCookie('loot', JSON.stringify(lootArray));
    lootArray[currentCell].take = takeF;
    lootAmmo.innerHTML = lootArray[currentCell].ammo;
    lootFood.innerHTML = lootArray[currentCell].food;
    lootAmmoWrap.style.display = ((lootArray[currentCell].ammo == 0) ? 'none' : 'block');
    lootFoodWrap.style.display = ((lootArray[currentCell].food == 0) ? 'none' : 'block');
    document.querySelectorAll('.take').forEach(function (element) {
        var x = element.id.slice(0, 3);
        var y = element.id.slice(3, 0);
        element.addEventListener('click', function () {
            lootArray[currentCell].take(y, x);
        });
    });

    var cc = qs('#c' + currentCell);

    player.style.top = cc.getBoundingClientRect().y + 'px';
    player.style.left = cc.getBoundingClientRect().x + 'px';


    function shoot(direction) {
        if (ammo > 0) {
            var bullet = document.createElement('div');
            bullet.className = 'bullet';
            bullet.innerHTML = "<img src='bullet.png' height='18px' width='18px'>"
            bullet.style.top = player.getBoundingClientRect().y + 'px';
            bullet.style.left = player.getBoundingClientRect().x + 'px';
            var playerX = player.getBoundingClientRect().x;
            var playerY = player.getBoundingClientRect().y;
            document.body.appendChild(bullet);
            var i = 0;
            var x = setInterval(function () {
                if (direction == 'up') {
                    bullet.style.top = playerY - i + 'px';
                } else if (direction == 'right') {
                    bullet.style.left = playerX + i + 'px';
                } else if (direction == 'left') {
                    bullet.style.left = playerX - i + 'px';
                } else if (direction == 'down') {
                    bullet.style.top = playerY + i + 'px';
                }
                i += 10;
                playerIsShooting = true;
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
                            player.style.top = qs('#c' + currentCell).getBoundingClientRect().y + 'px';
                            player.style.left = qs('#c' + currentCell).getBoundingClientRect().x + 'px';
                        }, 1500);
                        setCookie('energy', energy, 30);
                        energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
                        enemy.style.display = 'none';
                        clearInterval(x);
                        playerIsShooting = false;
                        fightHealthEl.style.display = 'none';
                        enemyHealthEl.style.display = 'none';
                        gameProgression += 100;
                    }
                    setCookie('gameprogression', gameProgression, 30);
                }
            }, 33);
            ammo--;
            ammoUsed++;
            ammoEl.innerHTML = 'Ammo: ' + ammo;
            ammoUsedEl.innerHTML = 'Ammo used: ' + ammoUsed;
            setCookie('ammo', ammo);
            setCookie('ammoused', ammoUsed);
            energy -= 0.2;
            energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
            setCookie('energy', energy);
            gameProgression += 0.2;
            setCookie('gameprogression', gameProgression, 30);
            setTimeout(function () {
                clearInterval(x);
                playerIsShooting = false;
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
            if (detectHit(bullet, player)) {
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
                    playerIsShooting = false;
                    fightHealthEl.style.display = 'none';
                    enemyHealthEl.style.display = 'none';
                    setTimeout(function () {
                        player.style.top = qs('#c' + currentCell).getBoundingClientRect().y + 'px';
                        player.style.left = qs('#c' + currentCell).getBoundingClientRect().x + 'px';
                    }, 1500);
                    setCookie('energy', energy, 30);
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
                        setCookie('energy', energy);
                        setCookie('health', health);
                        setCookie('ammo', ammo, 30);
                        setCookie('food', food, 30);
                        location.reload();
                    }, 3000);
                }
                health.innerHTML = 'Health: ' + health + '/' + maxHealth;
                clearInterval(x);
            }
            health.innerHTML = 'Health: ' + health + '/' + maxHealth;
            setCookie('health', health, 30);
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
        setCookie('name', name, 30);
    }, 1000)

    function eat(amount) {
        if (energy < maxEnergy && food >= amount) {
            food -= amount;
            energy += amount * 3;
            if (energy > maxEnergy)
                energy = maxEnergy;
            foodEl.innerHTML = 'Food: ' + food + ' [E to eat]';
            energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
            setCookie('food', food);
            setCookie('energy', energy);
        } else if (energy < maxEnergy && food < amount) {
            log('You have no food!')
        } else if (energy = maxEnergy) {
            log("Your energy is full. No need to eat.");
        }
    }

    var cc2 = qs('#c' + currentCell);
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
            name = getCookie('name');
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
            noise.seed(getCookie('seed'));
            saveFile = getCookie('saveFile');
        } else {
            setCookie('loot', JSON.stringify(lootArray), 30);
        }
    }
    
    if (readSaveFile != '')
        initFromSave();
    
    setCookie('checker', 'yup', 30);

    nameEl.innerHTML = name;
    healthEl.innerHTML = 'Health: ' + health + '/' + maxHealth;
    energyEl.innerHTML = 'Energy: ' + Math.round(energy) + '/' + maxEnergy;
    ammoEl.innerHTML = 'Ammo: ' + ammo;
    foodEl.innerHTML = 'Food: ' + food + ' [E to eat]';
    ammoUsedEl.innerHTML = 'Ammo used: ' + ammoUsed;
    stepsEl.innerHTML = 'Steps taken: ' + steps;
    qs('#log-heading').innerHTML = 'Log';
    lootAmmo.innerHTML = lootArray[currentCell].ammo;
    lootFood.innerHTML = lootArray[currentCell].food;
    lootAmmoWrap.style.display = ((lootArray[currentCell].ammo == 0) ? 'none' : 'block');
    lootFoodWrap.style.display = ((lootArray[currentCell].food == 0) ? 'none' : 'block');
    lootArray[currentCell].take = takeF;
    document.querySelectorAll('.take').forEach(function (element) {
        var x = element.id.slice(0, 3);
        var y = element.id.slice(3);
        element.addEventListener('click', function () {
            lootArray[currentCell].take(y, x);
        });
    });
    logEl.innerHTML = 'You awake into a strange world.';
    setTimeout(function () {
        log('Your memories are a messy blur.')
    }, 1500);
    setTimeout(function () {
        log('Distant flashbacks of the battlefield swirl through your mind.')
    }, 3000);

    var count = 1;

    function glitchInterval() {
        setTimeout(function () {
            var savePlayerCoordinates = player.getBoundingClientRect();
            $('html').css({ 'position': 'absolute', 'left': '89px' });
            setTimeout(function () { $('html').css('transform', 'scale(1.2), rotate(180deg)') }, 100);
            setTimeout(function () { $('html').css({ 'filter': 'invert(1)', 'left': '0' }) }, 150);
            setTimeout(function () {
                $('html').css({ 'filter': 'none', 'transform': 'none', 'position': 'relative' });
                player.style.left = savePlayerCoordinates.left + 'px';
                player.style.top = savePlayerCoordinates.top + 'px';
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

    if (worldSeed == 0 || getCookie('seed') == '')
        noise.seed(Math.random());

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

    var currentCellEl = qs('#c' + currentCell);
    if (lootArray[currentCell] == undefined)
        lootArray[currentCell] = new lootSpawn((currentCellEl.innerHTML == 'C'));
    setCookie('loot', JSON.stringify(lootArray));
    var currentLoot = lootArray[currentCell];

    lootAmmo.innerHTML = currentLoot.ammo;
    lootFood.innerHTML = currentLoot.food;
    lootAmmoWrap.style.display = ((currentLoot.ammo == 0) ? 'none' : 'block');
    lootFoodWrap.style.display = ((currentLoot.food == 0) ? 'none' : 'block');
    lootArray[currentCell].take = takeF;
    if (currentCellEl.innerHTML == "'")
        lootHeading.innerHTML = "[']" + ' Plains';
    if (currentCellEl.innerHTML == "*")
        lootHeading.innerHTML = "[*]" + ' Forest';
    if (currentCellEl.innerHTML == ",")
        lootHeading.innerHTML = "[,]" + ' Swamp';
    if (currentCellEl.innerHTML == "C")
        lootHeading.innerHTML = "[C]" + ' Chest';
    if (currentCellEl.innerHTML == "T") {
        lootHeading.innerHTML = "[T]" + ' Town';
        isTown = true;
    }
    if (currentCellEl.innerHTML == "L") 
        lootHeading.innerHTML = "[L]" + ' Lake';
    if (currentCellEl.innerHTML == "M") 
        lootHeading.innerHTML = "[M]" + ' Mountain';
        
    if (currentCellEl.innerHTML == " ") {
        lootHeading.innerHTML = "[ ]" + ' Empty';
    }

    function saveGame() {
        saveFile = [worldSeed, health, maxHealth, energy, maxEnergy, ammo, food, currentCell, 
            gameProgression, isTown, fightingMode].join('#') + '#';
        lootArray.forEach(function(element, index){
            if (element != null) {
                saveFile = saveFile + index + '|' + element.ammo + '|' + element.food + ',';
            }
        });
        saveFile = saveFile.slice(0,-1);
        saveFile = window.btoa(saveFile);
        setCookie('savefile', saveFile, 100);
        setCookie('name', name, 100);
    }
    
    function readSaveFile() {
        var decodedSaveFile = window.atob(saveFile);
        var split = decodedSaveFile.split('#');
        var loot = [];
        split[11].split(',').forEach(function(element){
            var x = element.split('|');
            loot[Number(x[0])] = {
                ammo: Number(x[1]),
                food: Number(x[2])
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

    function initFromSave() {
        var r = readSaveFile();
        worldSeed = r.seed;
        health = r.health;
        maxHealth = r.maxHealth;
        energy = r.energy;
        maxEnergy = r.maxEnergy;
        ammo = r.ammo;
        food = r.food;
        currentCell = r.currentCell;
        gameProgression = r.gameProgression;
        isTown = r.isTown;
        fightingMode = r.fightingMode;
        lootArray = r.loot;
    }
    
    setInterval(function(){
        saveGame();
        console.log(readSaveFile());
    }, 3000);    
    document.querySelector('#loading').style.display = 'none';
})(this);
