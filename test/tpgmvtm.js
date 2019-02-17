(function (el, w, h) {
    function Game() {
        this.coordinate = { x: 0, y: 0 };
        this.initialize_viewport = function (height, width) {
            var top = this.coordinate.y + Math.floor(height / 2);
            var left = this.coordinate.x - Math.floor(width / 2);
            for (var y = 0; y < height; y++) {
                var tr = document.createElement("tr");
                var sy = ((top - y) < 0 ? "n" : "") + String(top - y);
                tr.id = "r_" + sy;
                for (var x = 0; x < width; x++) {
                    var td = document.createElement("td");
                    var sx = ((left + x) < 0 ? "n" : "") + String(left + x);
                    td.id = "c_" + sx + "_" + sy;
                    td.innerText = String(left + x) + "," + String(top - y);
                    td.style.background = "rgb(" + Math.abs(left + x) * 8 % 256 + ',' + Math.abs(top - y) * 8 % 256 + ', 0)';
                    if (this.coordinate.x === left + x && this.coordinate.y == top - y) {
                        td.classList.add("current");
                    }
                    tr.appendChild(td);
                }
                if (el != null)
                    el.appendChild(tr);
            }
        };
        this.shift_viewport_vertically = function(is_up, distance){
            if(is_up){
                this.coordinate += distance;
            }
            else{
                this.coordinate -= distance;
            }
            /*
            //to-do: remove bottom <tr>'s and insert new <tr>'s at the top            
            */
        };
    }

    var game = new Game();
    game.initialize_viewport(w, h);

})(document.querySelector("#tvp"), 25, 25);