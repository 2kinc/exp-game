(function (el, w, h) {

    function Game(){
        this.coordinate = { x: 0, y: 0 };
        this.initialize_viewport = function(height, width) {
            var top = this.coordinate.y + Math.floor(height/2);
            var left = this.coordinate.x - Math.floor(width/2);
            for (var y = 0; y < height; y++) {
                var tr = document.createElement("tr");
                var sy = ((top - y)<0 ? "n" : "") + String(top - y);
                tr.id = "r_" + sy;
                for (var x = 0; x < width; x++) {
                    var td = document.createElement("td");
                    var sx = ((left + x)<0 ? "n" : "") + String(left + x);
                    td.id = "c_" + sx + "_" + sy;
                    td.innerText = String(left + x)+","+String(top - y);
                    tr.appendChild(td);
                }
                el.appendChild(tr);
            }
        };
    }

    var game = new Game();
    game.initialize_viewport(w, h);

})(document.getElementById("tvp"), 25, 25);