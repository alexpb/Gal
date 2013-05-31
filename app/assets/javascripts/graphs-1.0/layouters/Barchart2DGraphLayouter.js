function Barchart2DGraphLayouter(graph) {
    this.Graph = graph;
    this.NodeSpacing = 10;
    this.GraphRadius = (this.Graph.Width > this.Graph.Height ? this.Graph.Height / 5 : this.Graph.Width / 5);

    this.Layout = function () {
        var length = this.Graph.Nodes.length;
        var maxHeight = this.Graph.Width * 1 / 3;
        var barWidth = (this.Graph.Width * 0.9) / (length);
        var startingX = this.Graph.Width * 0.05 + barWidth / 2;
        if (length <= 3) { barWidth = this.Graph.Width * 0.1; startingX = (this.Graph.Width - ((length - 1) * barWidth)) / 2; }
        var startingY = this.Graph.Height * 3 / 6;
        var maxValue = 0;
        var minValue = 1.7976931348623157E+10308;
        var labelHeight = null;

        //calculate maxValue and labelHeight for faster rendering later
        for (var i = 0; i < length; i++) {
            if (this.Graph.Nodes[i].Value > maxValue) { maxValue = this.Graph.Nodes[i].Value; }
            labelHeight = 0;
        }
        var vertMultiplier = maxHeight / maxValue;

        var maxLabelHeight = 0;
        for (var i = 0; i < length; i++) {
            if (this.Graph.Nodes[i].Label != null) {
                //create a temp span in order to calculate the size (BBox) of the label
                var spanBBox = $('<span/>').appendTo(this.Graph.Container).hide().text(this.Graph.Nodes[i].Label.Text).css('font-size', this.Graph.Nodes[i].Label.FontSize);
                labelHeight = spanBBox.width();
                spanBBox.remove();
            }
            if (this.Graph.Nodes[i].Value * vertMultiplier + labelHeight > maxLabelHeight) { maxLabelHeight = this.Graph.Nodes[i].Value * vertMultiplier + labelHeight; }
            labelHeight = 0;
        }
        var labelCorr = maxHeight / maxLabelHeight
        vertMultiplier *= labelCorr;

        //var vertMultiplier = maxHeight / maxValue;

        //set nodes layout
        for (var i = 0; i < length; i++) {
            var node = this.Graph.Nodes[i];

            var height = node.Value * vertMultiplier;
            var width = barWidth * 0.9;
            var barY = startingY;
            var barX = startingX + i * barWidth;
            var bar = this.FindOrCreateShape(node, node, GraphShapeTypes.Rect);

            bar.X = barX;
            bar.Y = barY - height;
            bar.Width = width;
            bar.Height = height;
            bar.Color = node.Color;
            bar.StrokeColor = node.StrokeColor;

            //add label
            if (node.Label == null) { continue; }

            var label = this.FindOrCreateShape(node, node, GraphShapeTypes.Label);

            label.Text = node.Label.Text;
            label.FontSize = node.Label.FontSize;
            label.X = bar.X - label.FontSize / 2;
            label.Y = bar.Y + height + 4;
            label.Color = node.Label.Color;

            label.Other.rotationDegrees = 90;
            label.Other.transform = 'rotate(' + label.Other.rotationDegrees + ', ' + label.X + ', ' + label.Y + ')';
            label.Other.diffY = 4;
        }
        /*
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
        */
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
Barchart2DGraphLayouter.prototype = new BaseGraphLayouter();
// correct the constructor pointer because it points to BaseGraphLayouter
Barchart2DGraphLayouter.prototype.constructor = Barchart2DGraphLayouter;