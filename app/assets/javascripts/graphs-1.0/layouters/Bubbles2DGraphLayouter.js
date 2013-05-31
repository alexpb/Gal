function Bubbles2DGraphLayouter(graph) {
    this.Graph = graph;
    this.NodeSpacing = 5;
    this.GraphRadius = (this.Graph.Width > this.Graph.Height ? this.Graph.Height / 5 : this.Graph.Width / 5);
    this.MinFontSize = 5;// 11; //the layouter reduces the font til this value in order to fit the tet in the node

    this.Layout = function () {
        var length = this.Graph.Nodes.length;
        var percentage = 100 / length;
        var degrees = percentage * 3.6;
        var pi = 3.14;
        var centerX = this.Graph.Width / 2;
        var centerY = this.Graph.Height / 2;
        var circleArc = this.GraphRadius * (360 * pi / 180);
        var maxValue = 0;
        ////var maxRadius = ((circleArc - (length * this.NodeSpacing)) / length) / 2;
        var maxRadius = ((this.Graph.Width + this.Graph.Height - this._sq(length * this.NodeSpacing)) / length) / 2;

        //var maxRadius = 50; // (((this.Graph.Width * this.Graph.Height * 0.1) - (length * this.NodeSpacing)) / length) / 2;
        var labelHeight = null;
        var totalValue = 0;

        //calculate maxValue and labelHeight for faster rendering later
        for (var i = 0; i < length; i++) {
            if (this.Graph.Nodes[i].Value > maxValue) { maxValue = this.Graph.Nodes[i].Value; }

            totalValue += this._sq(this.Graph.Nodes[i].Value);

            if (labelHeight != null || this.Graph.Nodes[i].Label == null) { continue; }

            //create a temp span in order to calculate the size (BBox) of the label
            var spanBBox = $('<span/>').appendTo(this.Graph.Container).hide().text(this.Graph.Nodes[i].Label.Text).css('font-size', this.Graph.Nodes[i].Label.FontSize);

            labelHeight = spanBBox.height();

            //remove the temp span
            spanBBox.remove();
        }

        if (labelHeight == null) { labelHeight = 10; }

        //maxRadius = Math.sqrt(this.Graph.Width * this.Graph.Height) / Math.sqrt(totalValue);

        maxRadius = ((this.Graph.Width + this.Graph.Height - (2 * length * this.NodeSpacing)) / length);
        maxRadius = ((this.Graph.Width * this.Graph.Height) / (totalValue)) + 10;

        maxRadius = maxRadius;

        //var multiplier = Math.sqrt((this.Graph.Width - 300) * (this.Graph.Height - 300)) / Math.sqrt(totalValue * 4);
        var multiplier = Math.sqrt((this.Graph.Width) * (this.Graph.Height) * 0.3) / Math.sqrt(totalValue * 4);

        //console.log(maxRadius);
        //console.log(multiplier)

        //reorder nodes from biggets to smallest
        this.Graph.Nodes.sort(this._compareNodesValue);

        //set nodes layout
        for (var i = 0; i < length; i++) {
            var node = this.Graph.Nodes[i];

            //add circle shape
            var radians = (degrees * i) * pi / 180;
            var radius = (node.Value / maxValue) * maxRadius;
            radius = node.Value * multiplier;

            //calculate node postition
            var randX = centerX;
            var randY = centerY;
            var overlap = true;
            var temp_rad_diff = 0;
            var temp_dist = 0;

            //add background black circle
            //todo: fix FindOrCreateShape
            var circleBg = this.CreateShape(node, node, GraphShapeTypes.Circle);

            circleBg.Radius = radius * 2;
            circleBg._Type = "background";
            //circleBg.X = centerX + Math.sin(radians) * this.GraphRadius;
            //circleBg.Y = centerY + Math.cos(radians) * this.GraphRadius;
            //todo: fix color
            circleBg.Color = '#000000';
            //circleBg.StrokeColor = node.StrokeColor;
            circleBg.Other.frontBackIndex = -i; //i;

            //add main circle shape
            //todo: fix FindOrCreateShape
            var circle = this.CreateShape(node, node, GraphShapeTypes.Circle);

            circle.Radius = radius;
            circle.X = centerX; // +Math.sin(radians) * this.GraphRadius;
            circle.Y = centerY; // +Math.cos(radians) * this.GraphRadius;
            circle.Color = node.Color; //this._getRandomColor();
            circle.StrokeColor = node.StrokeColor;
            circle.Other.frontBackIndex = i;  //length + i;

            if (i > 0) {
                while (overlap == true) {
                    //go trough previous nodes and check their positions
                    for (var j = 0; j < i; j++) {
                        var shape = this.Graph.Nodes[j].Shapes[1];

                        temp_dist = this._Dist(randX, randY, shape.X, shape.Y);
                        temp_rad_diff = circle.Radius + shape.Radius + this.NodeSpacing;

                        if (temp_dist > temp_rad_diff) {
                            overlap = false;
                        }
                        else {
                            overlap = true;
                            break;
                        }
                    }

                    if (overlap == true) {
                        randX += this._getRandomInt(10) - this._getRandomInt(10);
                        randY += this._getRandomInt(10) - this._getRandomInt(10);
                    }
                    else {
                        //console.log("rand_x: " + rand_x + " rand_y: " + rand_y)
                        circle.X = randX;
                        circle.Y = randY;
                    }
                }
            }

            circleBg.X = circle.X;
            circleBg.Y = circle.Y;


            //add label 7
            //if ((circle.Radius * 2 - 10) < (node.Label.Text.length * 7)) { continue; }

            //reduce font size in order to fit the text in the circle
            while (node.Label.FontSize >= this.MinFontSize) {
                if ((circle.Radius * 2 - 10) < (node.Label.Text.length * node.Label.FontSize * 0.7)) {
                    node.Label.FontSize--;
                } else {
                    break;
                }
            }

            if (node.Label.FontSize < this.MinFontSize) { continue; }

            //continue;
            if (node.Label == null) { continue; }

            var label = this.FindOrCreateShape(node, node, GraphShapeTypes.Label);

            label.Text = node.Label.Text; // +" (" + node.Value + " - " + circle.Radius + ")";
            label.FontSize = node.Label.FontSize
            label.X = circle.X;
            label.Y = circle.Y + (labelHeight / 3);
            //todo: fix color
            label.Color = node.Label.Color;

            //label.Other.rotationDegrees = (degrees * i);

            label.Other.textAnchor = 'middle';
            //label.Other.dominantBaseline = 'center';

            //            if (label.Other.rotationDegrees >= 0 && label.Other.rotationDegrees <= 180) {
            //                label.Other.rotationDegrees = -label.Other.rotationDegrees + 90;
            //                label.Other.transform = 'rotate(' + label.Other.rotationDegrees + ', ' + label.X + ', ' + label.Y + ')';
            //                label.Other.textAnchor = 'start';
            //                label.Other.diffX = (circle.Radius + 4);
            //                label.Other.diffY = (labelHeight / 3);
            //            } else {
            //                label.Other.rotationDegrees = -label.Other.rotationDegrees + 270;
            //                label.Other.transform = 'rotate(' + label.Other.rotationDegrees + ', ' + label.X + ', ' + label.Y + ')';
            //                label.Other.textAnchor = 'end';
            //                label.Other.diffX = -(circle.Radius + 4);
            //                label.Other.diffY = (labelHeight / 3);
            //            }

            //label.X += label.Other.diffX;
            //label.Y += label.Other.diffY
        }

        var connLength = this.Graph.Connections.length;

        //set connections layout
        for (var i = 0; i < connLength; i++) {
            var conn = this.Graph.Connections[i];
            var curve = this.FindOrCreateShape(conn, node, GraphShapeTypes.Curve);

            curve.X1 = conn.Node1.Shapes[0].X;
            curve.Y1 = conn.Node1.Shapes[0].Y;

            curve.X2 = conn.Node2.Shapes[0].X;
            curve.Y2 = conn.Node2.Shapes[0].Y;

            curve.CX = centerX;
            curve.CY = centerY;
        }

        //reorder nodes from biggets to smallest
        //this.Graph.Nodes.sort(this._compareNodesValue);
    };

    this._Dist = function () {
        var dx, dy, dz;
        if (arguments.length === 4) {
            dx = arguments[0] - arguments[2];
            dy = arguments[1] - arguments[3];
            return Math.sqrt(dx * dx + dy * dy);
        } else if (arguments.length === 6) {
            dx = arguments[0] - arguments[3];
            dy = arguments[1] - arguments[4];
            dz = arguments[2] - arguments[5];
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
    };

    this._sq = function (aNumber) {
        return aNumber * aNumber;
    };

    this._getRandomColor = function () {
        return 'rgb(' + this._getRandomInt(255) + ',' + this._getRandomInt(255) + ',' + this._getRandomInt(255) + ')'; ;
    };

    this._getRandomInt = function (maxValue) {
        return Math.floor((Math.random() * (maxValue + 1)));
    };

    this._compareNodesValue = function compare(a, b) {
        if (a.Value < b.Value) { return 1; }
        if (a.Value > b.Value) { return -1; }
        return 0;
    };

};

// inherit BaseGraphLayouter
Bubbles2DGraphLayouter.prototype = new BaseGraphLayouter();
// correct the constructor pointer because it points to BaseGraphLayouter
Bubbles2DGraphLayouter.prototype.constructor = Bubbles2DGraphLayouter;