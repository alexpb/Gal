function PincushionWithCurveArrows2DGraphLayouter(graph) {
    this.Graph = graph;
    this.NodeSpacing = 0;
    this.GraphRadius;
    if (this.Graph.Width >= this.Graph.Height) { this.GraphRadius = this.Graph.Height * 0.2; } else { this.GraphRadius = this.Graph.Width * 0.2; }


    this.Layout = function () {
        var length = this.Graph.Nodes.length;
        //var percentage = 50 / (length - 1);
        //var percentage = (length > 50 ? 100 : 50) / (length - 1);
        var percentage = (length > 50 ? 100 / length : 50 / (length - 1));
        var percentage = 100 / length;
        if (length <= 3) { percentage = 5; }
        var degrees = percentage * -3.6;
        var pi = 3.14;
        var centerX = this.Graph.Width / 2;
        var centerY = this.Graph.Height / 2;
        var circleArc = this.GraphRadius * (360 * pi / 180);
        var maxValue = 0;
        var maxLabelHeight = 0;
        var maxHeight;
        if (this.Graph.Width >= this.Graph.Height) { maxHeight = (this.Graph.Height - this.GraphRadius * 2) * 0.45; } else { maxHeight = (this.Graph.Width - this.GraphRadius * 2) * 0.45; }
        var labelHeight = null;
        var width = circleArc * (percentage / (100 * (1 + this.NodeSpacing)));

        //calculate maxValue and labelHeight for faster rendering later
        for (var i = 0; i < length; i++) {
            if (this.Graph.Nodes[i].Label != null) {

                //create a temp span in order to calculate the size (BBox) of the label
                var spanBBox = $('<span/>').appendTo(this.Graph.Container).hide().text(this.Graph.Nodes[i].Label.Text).css('font-size', this.Graph.Nodes[i].Label.FontSize);

                labelHeight = spanBBox.width();
                spanBBox.remove();

                if (labelHeight > maxLabelHeight) { maxLabelHeight = labelHeight; }

            }
            if (this.Graph.Nodes[i].Value > maxValue) { maxValue = this.Graph.Nodes[i].Value; }
            labelHeight = 0;
        }

        maxHeight -= maxLabelHeight;

        var height_multiplier = maxHeight / maxValue;

        //        for (var i = 0; i < length; i++) {
        //            if (this.Graph.Nodes[i].Value > maxValue) { maxValue = this.Graph.Nodes[i].Value; }
        //            labelHeight = 0;
        //        }
        //        var height_multiplier = maxHeight / maxValue;

        //        var maxLabelHeight = 0;
        //        for (var i = 0; i < length; i++) {
        //            if (this.Graph.Nodes[i].Label != null) {
        //                //create a temp span in order to calculate the size (BBox) of the label
        //                var spanBBox = $('<span/>').appendTo(this.Graph.Container).hide().text(this.Graph.Nodes[i].Label.Text).css('font-size', this.Graph.Nodes[i].Label.FontSize);
        //                labelHeight = spanBBox.width();
        //                spanBBox.remove();
        //            }
        //            if (this.Graph.Nodes[i].Value * height_multiplier + labelHeight > maxLabelHeight) { maxLabelHeight = this.Graph.Nodes[i].Value * height_multiplier + labelHeight; }
        //            labelHeight = 0;
        //        }
        //        var labelCorr = maxHeight / maxLabelHeight
        //        height_multiplier *= labelCorr;

        if (labelHeight == null) { labelHeight = 10; }

        //set nodes layout
        for (var i = 0; i < length; i++) {
            var node = this.Graph.Nodes[i];
            var radians = (degrees * i - 90) * pi / 180;
            var height = node.Value * height_multiplier;

            var rect = this.FindOrCreateShape(node, node, GraphShapeTypes.Rect);
            rect.Width = width;
            rect.Height = height;
            rect.X = centerX + Math.sin(radians) * this.GraphRadius;
            rect.Y = centerY + Math.cos(radians) * this.GraphRadius;
            rect.Other.rotationDegrees = (degrees * i - 90);
            rect.Other.rotationDegrees = -rect.Other.rotationDegrees;
            rect.Other.transform = 'rotate(' + rect.Other.rotationDegrees + ', ' + rect.X + ', ' + rect.Y + ')';

            rect.Color = node.Color;
            rect.StrokeColor = node.StrokeColor;

            //add label
            if (node.Label == null) { continue; }

            var label = this.FindOrCreateShape(node, node, GraphShapeTypes.Label);

            label.Text = node.Label.Text;
            label.FontSize = node.Label.FontSize;
            label.X = rect.X;
            label.Y = rect.Y;
            label.Color = node.Label.Color;

            label.Other.rotationDegrees = (degrees * i - 90);

            //label.Text = node.Label.Text + label.Other.rotationDegrees;
            if (label.Other.rotationDegrees >= -360 && label.Other.rotationDegrees <= -180) {
                label.Other.rotationDegrees = -label.Other.rotationDegrees + 90;
                label.Other.transform = 'rotate(' + label.Other.rotationDegrees + ', ' + label.X + ', ' + label.Y + ')';
                label.Other.textAnchor = 'start';
                label.Other.diffX = (rect.Height + 4);
                label.Other.diffY = 4;
            } else {
                label.Other.rotationDegrees = -label.Other.rotationDegrees + 270;
                label.Other.transform = 'rotate(' + label.Other.rotationDegrees + ', ' + label.X + ', ' + label.Y + ')';
                label.Other.textAnchor = 'end';
                label.Other.diffX = -(rect.Height + 4);
                label.Other.diffY = 4;
            }

            label.X += label.Other.diffX;
            label.Y += label.Other.diffY
        }

        var connLength = this.Graph.Connections.length;

        //set connections layout
        for (var i = 0; i < connLength; i++) {
            var conn = this.Graph.Connections[i];
            var curve = this.FindOrCreateShape(conn, node, GraphShapeTypes.CurveArrow);

            if (conn.ArrowDirection == null) { conn.ArrowDirection = ArrowDirections.Outbound; }
            
            curve.ArrowDirection = conn.ArrowDirection;

            curve.X1 = conn.Node1.Shapes[0].X;
            curve.Y1 = conn.Node1.Shapes[0].Y;

            curve.X2 = conn.Node2.Shapes[0].X;
            curve.Y2 = conn.Node2.Shapes[0].Y;

            curve.CX = centerX;
            curve.CY = centerY;
        }
    };

    this.SetConnectionsLayout = function () {
        var centerX = this.Graph.Width / 2;
        var centerY = this.Graph.Height / 2;
        var connLength = this.Graph.Connections.length;

        //set connections layout
        for (var i = 0; i < connLength; i++) {
            var conn = this.Graph.Connections[i];
            var curve = this.FindOrCreateShape(conn, node, GraphShapeTypes.CurveArrow);

            if (conn.ArrowDirection == null) { conn.ArrowDirection = ArrowDirections.Outbound; }

            curve.ArrowDirection = conn.ArrowDirection;

            curve.X1 = conn.Node1.Shapes[0].X;
            curve.Y1 = conn.Node1.Shapes[0].Y;

            curve.X2 = conn.Node2.Shapes[0].X;
            curve.Y2 = conn.Node2.Shapes[0].Y;

            curve.CX = centerX;
            curve.CY = centerY;
        }
    };
   

};

// inherit BaseGraphLayouter
PincushionWithCurveArrows2DGraphLayouter.prototype = new BaseGraphLayouter();
// correct the constructor pointer because it points to BaseGraphLayouter
PincushionWithCurveArrows2DGraphLayouter.prototype.constructor = PincushionWithCurveArrows2DGraphLayouter;