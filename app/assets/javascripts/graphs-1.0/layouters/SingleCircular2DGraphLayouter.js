function SingleCircular2DGraphLayouter(graph) {
    this.Graph = graph;
    this.NodeSpacing = 10;
    this.GraphRadius = (this.Graph.Width > this.Graph.Height ? this.Graph.Height / 5 : this.Graph.Width / 5);

    this.Layout = function () { 
        var length = this.Graph.Nodes.length;
        var percentage = 100 / length;
        var degrees = percentage * -3.6;
        var pi = 3.14;
        var centerX = this.Graph.Width / 2;
        var centerY = this.Graph.Height / 2;
        var circleArc = this.GraphRadius * (360 * pi / 180);
        var maxValue = 0;        
        var circumf = 2 * pi * this.GraphRadius;
        var labelHeight = null;
        var total = 0;

        //calculate maxValue and labelHeight for faster rendering later
        for (var i = 0; i < length; i++) {
            if (this.Graph.Nodes[i].Value > maxValue) { maxValue = this.Graph.Nodes[i].Value; }
            total += 4 * Math.sqrt(this.Graph.Nodes[i].Value / pi) * 1.5;
            if (labelHeight != null || this.Graph.Nodes[i].Label == null) { continue; }

            //create a temp span in order to calculate the size (BBox) of the label
            var spanBBox = $('<span/>').appendTo(this.Graph.Container).hide().text(this.Graph.Nodes[i].Label.Text).css('font-size', this.Graph.Nodes[i].Label.FontSize);

            labelHeight = spanBBox.height();

            //remove the temp span
            spanBBox.remove();
        }

        if (labelHeight == null) { labelHeight = 10; }

        var multiplier = circumf / total;

        if (length < 4) { multiplier = this.GraphRadius / 1.5 / maxValue; }

        //set nodes layout
        for (var i = 0; i < length; i++) {
            var node = this.Graph.Nodes[i];

            //add circle shape
            var radians = (degrees * i - 90) * pi / 180;
            var radius = node.Value * multiplier / 2;
            var circle = this.FindOrCreateShape(node, node, GraphShapeTypes.Circle);

            circle.Radius = radius;
            circle.X = centerX + Math.sin(radians) * this.GraphRadius;
            circle.Y = centerY + Math.cos(radians) * this.GraphRadius;
            circle.Color = node.Color;
            circle.StrokeColor = node.StrokeColor;

            //add label
            if (node.Label == null) { continue; }

            var label = this.FindOrCreateShape(node, node, GraphShapeTypes.Label);
           
            label.Text = node.Label.Text;
            label.FontSize = node.Label.FontSize
            label.X = circle.X;
            label.Y = circle.Y;
            label.Color = node.Label.Color;

            label.Other.rotationDegrees = (degrees * i - 90);

            if (label.Other.rotationDegrees >= -360 && label.Other.rotationDegrees <= -180) {
            
                label.Other.rotationDegrees = -label.Other.rotationDegrees + 90;
                label.Other.transform = 'rotate(' + label.Other.rotationDegrees + ', ' + label.X + ', ' + label.Y + ')';
                label.Other.textAnchor = 'start';
                label.Other.diffX = (circle.Radius + 4);
                label.Other.diffY = (labelHeight / 3);
            } else {
                label.Other.rotationDegrees = -label.Other.rotationDegrees + 270;
                label.Other.transform = 'rotate(' + label.Other.rotationDegrees + ', ' + label.X + ', ' + label.Y + ')';
                label.Other.textAnchor = 'end';
                label.Other.diffX = -(circle.Radius + 4);
                label.Other.diffY = (labelHeight / 3);
            }

            label.X += label.Other.diffX;
            label.Y += label.Other.diffY
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
    };

    

//    this.ReLayoutTest = function () {
//        var length = this.Graph.Nodes.length;
//        var maxValue = 0;
//        var maxRadius = ((this.Graph.Width - (length * this.NodeSpacing)) / length) / 2;

//        maxRadius = 10;

//        var percentage = 100 / length;
//        var degrees = percentage * 3.6;
//        var pi = 3.14;

//        var centerX = this.Graph.Width / 2;
//        var centerY = this.Graph.Height / 2;

//        for (var i = 0; i < length; i++) {
//            if (this.Graph.Nodes[i].Value > maxValue) { maxValue = this.Graph.Nodes[i].Value; }
//        }

//        //set nodes layout
//        for (var i = 0; i < length; i++) {
//            var node = this.Graph.Nodes[i];

//            //update circle shape
//            var radius = (node.Value / maxValue) * maxRadius;
//            var circle = node.Shapes[0];

//            var radians = (degrees * i) * pi / 180;

//            circle.Radius = radius;

//            circle.X = centerX + Math.sin(radians) * this.GraphRadius;
//            circle.Y = centerY + Math.cos(radians) * this.GraphRadius;

//            //update label
//            if (node.Label == null) { continue; }
//            var label = node.Shapes[1];
//            label.Color = node.Label.Color;

//            label.X = circle.X;
//            label.Y = circle.Y;            
//        }

//        var connLength = this.Graph.Connections.length;

//        //set connections layout
//        for (var i = 0; i < connLength; i++) {
//            var conn = this.Graph.Connections[i];

//            var curve = conn.Shapes[0];

//            curve.X1 = conn.Node1.Shapes[0].X;
//            curve.Y1 = conn.Node1.Shapes[0].Y;

//            curve.X2 = conn.Node2.Shapes[0].X;
//            curve.Y2 = conn.Node2.Shapes[0].Y;

//            curve.CX = centerX;
//            curve.CY = centerY;
//        }
//    };

};

// inherit BaseGraphLayouter
SingleCircular2DGraphLayouter.prototype = new BaseGraphLayouter();
// correct the constructor pointer because it points to BaseGraphLayouter
SingleCircular2DGraphLayouter.prototype.constructor = SingleCircular2DGraphLayouter;