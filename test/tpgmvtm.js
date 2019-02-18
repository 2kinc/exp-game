(function (el, w, h, global) {
    function Game() {
        this.coordinate = { x: 0, y: 0 };
        this.MapTile = function (coords, loot, terrain, properties) {
            this.coordinates = coords;
            this.loot = loot;
            this.terrain = terrain;
            this.properties = properties;
        }
        this.getTileElement = function (x, y) {
            return document.querySelector('#c_' + this.for_id(x) + '_' + this.for_id(y));
        }
        var that = this;
        this.Chunk = function (sideLength, bottomleft, seed) {
            this.terrain = [];
            noise.seed(seed);
            for (var x = bottomleft.x; x < sideLength + bottomleft.x; x++) {
                for (var y = bottomleft.y; y < sideLength + bottomleft.y; y++) {
                    // All noise functions return values in the range of -1 to 1.

                    // noise.simplex2 and noise.perlin2 for 2d noise
                    var value = noise.simplex2(x / 100, y / 100);
                    if (value < 0) {
                        value = 1 - Math.abs(value);
                    }
                    if (value >= 0.75) {
                        value = "🌊";
                    } else if (value >= 0.45) {
                        value = "🏜️";
                    } else if (value >= 0.25) {
                        value = "🌿";
                    } else if (value >= 0) {
                        value = "🌲";
                    } else {
                        value = '.';
                    }
                    // ... or noise.simplex3 and noise.perlin3:
                    var newTile = new that.MapTile({ x: x, y: y }, null, value, null);
                    this.terrain.push(newTile);
                }
            }
        }
        this.renderChunks = function (chunks) {
            var that = this;
            chunks.forEach(function (chunk) {
                var a = chunk.terrain;
                a.forEach(function (element) {
                    var x = element.coordinates.x;
                    var y = element.coordinates.y;
                    var tile = that.getTileElement(x, y);
                    tile.innerHTML = element.terrain;
                    if (tile.innerHTML == '🌊') {
                        tile.style.background = 'rgb(3,169,244)';
                    } else if (tile.innerHTML == '🏜️') {
                        tile.style.background = 'rgb(251,192,45)';
                    } else if (tile.innerHTML == '🌿') {
                        tile.style.background = 'rgb(139,195,74)';
                    } else if (tile.innerHTML == '🌲') {
                        tile.style.background = 'rgb(121,85,72)';
                    } 
                });
            }
            )
        }
        this.get_topleft = function () {
            return {
                y: this.coordinate.y + Math.floor(h / 2),
                x: this.coordinate.x - Math.floor(w / 2)
            }
        };
        this.get_bottomleft = function () {
            return {
                x: this.coordinate.x - Math.floor(w / 2),
                y: this.coordinate.y - Math.floor(h / 2)
            }
        }
        this.get_topright = function () {
            return {
                x: this.coordinate.x + Math.floor(w / 2),
                y: this.coordinate.y + Math.floor(h / 2)
            }
        }
        this.get_bottomright = function () {
            return {
                x: this.coordinate.x + Math.floor(w / 2),
                y: this.coordinate.y - Math.floor(h / 2)
            }
        }
        this.for_id = function (n) {
            return String(Math.abs(n)) + (n < 0 ? "n" : "");
        };
        this.get_tile_id = function (sx, sy) {
            return "c_" + sx + "_" + sy;
        };
        this.updateCenterEl = function () {
            var c = document.querySelector("td.current");
            if (c) {
                c.classList.remove("current");
            }
            c = document.getElementById(this.get_tile_id(this.for_id(this.coordinate.x), this.for_id(this.coordinate.y)));
            if (c) {
                c.classList.add("current");
            }
        }
        this.generate_rows = function (topleft, n_rows, n_cols, start_index) {
            var anchor = null;
            if (start_index >= 0) {
                anchor = el.children[start_index];
            }
            if (start_index < 0) {
                anchor = el.children[el.children.length + start_index];
            }
            for (var y = 0; y < n_rows; y++) {
                var tr = document.createElement("tr");
                var sy = this.for_id(topleft.y - y);
                tr.id = "r_" + sy;
                for (var x = 0; x < n_cols; x++) {
                    var td = document.createElement("td");
                    var sx = this.for_id(topleft.x + x);
                    td.id = this.get_tile_id(sx, sy);
                    td.innerText = String(topleft.x + x) + "," + String(topleft.y - y);
                    //td.style.background = "rgb(" + Math.abs(topleft.x + x) * 8 % 256 + ',' + Math.abs(topleft.y - y) * 8 % 256 + ', 0)';
                    tr.appendChild(td);
                }
                if (anchor) {
                    el.insertBefore(tr, anchor);
                }
                else {
                    el.appendChild(tr);
                }
            }
            this.updateCenterEl();
        };
        this.generate_columns = function (topleft, n_rows, n_cols, start_index) {
            for (var x = 0; x < n_cols; x++) {
                var sx = this.for_id(topleft.x + x);
                var sy = this.for_id(topleft.y);
                for (var y = 0; y < n_rows; y++) {
                    var td = document.createElement("td");
                    var rows = el.children;
                    sy = this.for_id(topleft.y - y);
                    td.id = this.get_tile_id(sx, sy);
                    td.innerText = String(topleft.x + x) + "," + String(topleft.y - y);
                    //td.style.background = "rgb(" + Math.abs(topleft.x + x) * 8 % 256 + ',' + Math.abs(topleft.y - y) * 8 % 256 + ', 0)';
                    rows[y].insertBefore(td, rows[y].children[start_index]);
                }
            }
            this.updateCenterEl();
        }
        this.initialize_viewport = function () {
            var topleft = this.get_topleft();
            this.generate_rows(topleft, h, w);
            var that = this;
            document.onkeypress = function (event) {
                if (event.key === "W" || event.key === "w") {
                    that.shift_viewport_vertically(1);
                } else if (event.key === "S" || event.key === "s") {
                    that.shift_viewport_vertically(-1);
                } else if (event.key === "D" || event.key === "d") {
                    that.shift_viewport_horizontally(1);
                } else if (event.key === "A" || event.key === "a") {
                    that.shift_viewport_horizontally(-1);
                }
            }
            var a = new this.Chunk(25, { x: this.get_bottomleft().x, y: this.get_bottomleft().y }, 32422);
            this.renderChunks([a]);
        };
        this.shift_viewport_vertically = function (distance) {
            this.coordinate.y += distance;
            if (distance > 0) {
                console.log("moving up");
                for (var i = 0; i < distance; i++) {
                    el.removeChild(el.lastChild);
                }

                var tl = this.get_topleft();
                this.generate_rows(tl, distance, w, 0);
            } else if (distance < 0) {
                console.log("moving down");
                for (var i = 0; i < Math.abs(distance); i++) {
                    el.removeChild(el.children[0]);
                }

                var tl = this.get_bottomleft();
                this.generate_rows(tl, Math.abs(distance), w);
            }
            var a = new this.Chunk(25, { x: this.get_bottomleft().x, y: this.get_bottomleft().y }, 32422);
            this.renderChunks([a]);
        };
        this.shift_viewport_horizontally = function (distance) {
            this.coordinate.x += distance;
            if (distance > 0) {
                console.log(el.children);
                for (var i = 0; i < h; i++) {
                    var row = el.children;
                    var k = i;
                    for (var j = 0; j < distance; j++) {
                        row[k].removeChild(row[k].children[0]);
                    }
                }
                var tl = this.get_topright();
                this.generate_columns(tl, h, distance, -1);
                console.log('moving right');
            } else if (distance < 0) {
                for (var i = 0; i < h; i++) {
                    var row = el.children;
                    var k = i;
                    for (var j = 0; j < Math.abs(distance); j++) {
                        row[k].removeChild(row[k].lastChild);
                    }
                }

                var tl = this.get_topleft();
                this.generate_columns(tl, h, Math.abs(distance), 0);
                console.log('moving left');
            }
            var a = new this.Chunk(25, { x: this.get_bottomleft().x, y: this.get_bottomleft().y }, 32422);
            this.renderChunks([a]);
        }
    }

    global.game = new Game();
    global.game.initialize_viewport();

})(document.querySelector("#tvp"), 25, 25, this);