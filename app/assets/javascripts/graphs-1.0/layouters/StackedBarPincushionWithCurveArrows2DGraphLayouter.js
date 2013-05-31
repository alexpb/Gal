function StackedBarPincushionWithCurveArrows2DGraphLayouter(graph) {
    this.Graph = graph;
    this.NodeSpacing = 0;
    this.GraphRadius;
    if (this.Graph.Width >= this.Graph.Height) { this.GraphRadius = this.Graph.Height * 0.15; } else { this.GraphRadius = this.Graph.Width * 0.15; }
    this.Settings = null;

    this.Layout = function () {
        var length = this.Graph.Nodes.length;
        //var percentage = ((length) > 50 ? 100 / (length) : 50 / (length));
        var percentage = 100 / (length);
        if (length <= 3) { percentage = 5; }
        var degrees = percentage * -3.6;
        var pi = 3.14;
        var centerX = this.Graph.Width / 2;
        var centerY = this.Graph.Height / 2;
        var circleArc = this.GraphRadius * (360 * pi / 180);
        var maxValue = 0;
        var maxLabelHeight = 0;
        var maxHeight;
        var radians = -90 * pi / 180;
        if (this.Graph.Width >= this.Graph.Height) { maxHeight = (this.Graph.Height - this.GraphRadius * 2) * 0.3; } else { maxHeight = (this.Graph.Width - this.GraphRadius * 2) * 0.45; }
        var labelHeight = null;
        var width = circleArc * (percentage / (100 * (1 + this.NodeSpacing)));

        if (this.Settings == null) {
            this.Settings = this.GetNodesMaxValueAndMaxLabelHeight();
        }

        maxValue = this.Settings.maxValue;
        maxLabelHeight = this.Settings.maxLabelHeight;
                
        maxHeight -= maxLabelHeight;
        var height_multiplier = maxHeight / maxValue; // Math.log(maxHeight / 4) / Math.log(maxValue);

        if (labelHeight == null) { labelHeight = 10; }

        this.SetNodesLayout(percentage, height_multiplier, radians);

        //        var connLength = this.Graph.Connections.length;

        //        //set connections layout
        //        for (var i = 0; i < connLength; i++) {
        //            var conn = this.Graph.Connections[i];
        //            var curve = this.FindOrCreateShape(conn, null, GraphShapeTypes.CurveArrow);

        //            if (conn.ArrowDirection == null) { conn.ArrowDirection = ArrowDirections.Outbound; }

        //            curve.ArrowDirection = conn.ArrowDirection;

        ////            curve.X1 = conn.Node1.Shapes[0].X;
        ////            curve.Y1 = conn.Node1.Shapes[0].Y;

        ////            curve.X2 = conn.Node2.Shapes[0].X;
        //            //            curve.Y2 = conn.Node2.Shapes[0].Y;

        //            curve.X1 = conn.Node1._stackedBarX;
        //            curve.Y1 = conn.Node1._stackedBarY;

        //            curve.X2 = conn.Node2._stackedBarX;
        //            curve.Y2 = conn.Node2._stackedBarY;

        //            curve.CX = centerX;
        //            curve.CY = centerY;
        //        }

        this.SetConnectionsLayout();
    };

    this.SetConnectionsLayout = function () {
        var centerX = this.Graph.Width / 2;
        var centerY = this.Graph.Height / 2;
        var connLength = this.Graph.Connections.length;

        //set connections layout
        for (var i = 0; i < connLength; i++) {
            var conn = this.Graph.Connections[i];
            var curve = this.FindOrCreateShape(conn, null, GraphShapeTypes.CurveArrow);

            if (conn.ArrowDirection == null) { conn.ArrowDirection = ArrowDirections.Outbound; }

            curve.ArrowDirection = conn.ArrowDirection;
            
            curve.X1 = conn.Node1._stackedBarX;
            curve.Y1 = conn.Node1._stackedBarY;

            curve.X2 = conn.Node2._stackedBarX;
            curve.Y2 = conn.Node2._stackedBarY;

            curve.CX = centerX;
            curve.CY = centerY;
        }
    };

    this.SetNodesLayout = function (percentage, height_multiplier, radians, parentNode) {
        var nodes = (parentNode !== undefined ? parentNode.ChildNodes : this.Graph.Nodes);
        var length = nodes.length;
        var degrees = percentage * -3.6;
        var pi = 3.14;
        var centerX = this.Graph.Width / 2;
        var centerY = this.Graph.Height / 2;
        var circleArc = this.GraphRadius * (360 * pi / 180);
        var width = circleArc * (percentage / (100 * (1 + this.NodeSpacing)));
        var heightCounter = 0;

        //set nodes layout        
        for (var i = 0; i < length; i++) {
            var node = nodes[i];
            var tempX = centerX + Math.sin(radians) * this.GraphRadius;
            var tempY = centerY + Math.cos(radians) * this.GraphRadius;

            node.CalculateValueFromChildNodes();
            var height = node.Value * height_multiplier;
            //            var height = Math.pow(node.Value, height_multiplier);
            //console.log(node.Id + ' - ' + node.Value + ' - ' + height + ' - ' + height_multiplier);

            if (parentNode !== undefined) {
                var rect = this.FindOrCreateShape(node, node, GraphShapeTypes.Rect);
                rect.Width = width;
                rect.Height = height;
                rect.X = tempX + Math.sin(radians) * heightCounter;
                rect.Y = tempY + Math.cos(radians) * heightCounter;
                rect.Other.rotationDegrees = -(radians) * 180 / pi;
                rect.Other.transform = 'rotate(' + rect.Other.rotationDegrees + ', ' + rect.X + ', ' + rect.Y + ')';
                heightCounter += height;
                rect.Color = node.Color;
                rect.StrokeColor = node.StrokeColor;
            }

            node._stackedBarX = tempX;
            node._stackedBarY = tempY;
            //if (node.Id == 'MD-state') { console.log(node.Id + ": " + node.Value) }
            //add label             
            if (node.Label == null) { continue; }

            var label = this.FindOrCreateShape(node, node, GraphShapeTypes.Label);

            label.Text = node.Label.Text;

            label.FontSize = node.Label.FontSize;
            label.X = centerX + Math.sin(radians) * (this.GraphRadius + height);
            label.Y = centerY + Math.cos(radians) * (this.GraphRadius + height);
            label.Color = node.Label.Color;

            label.Other.rotationDegrees = (radians) * 180 / pi;
            if (label.Other.rotationDegrees >= -360 && label.Other.rotationDegrees <= -180) {
                label.Other.rotationDegrees = -label.Other.rotationDegrees + 90;
                label.Other.transform = 'rotate(' + label.Other.rotationDegrees + ', ' + label.X + ', ' + label.Y + ')';
                label.Other.textAnchor = 'start';
                label.Other.diffX = 4;
                label.Other.diffY = 4;
            } else {
                label.Other.rotationDegrees = -label.Other.rotationDegrees + 270;
                label.Other.transform = 'rotate(' + label.Other.rotationDegrees + ', ' + label.X + ', ' + label.Y + ')';
                label.Other.textAnchor = 'end';
                label.Other.diffX = -(4);
                label.Other.diffY = 4;
            }

            label.X += label.Other.diffX;
            label.Y += label.Other.diffY;


            this.SetNodesLayout(percentage, height_multiplier, radians, node)
            radians += (degrees) * pi / 180;


        }
    };
};

// inherit BaseGraphLayouter
StackedBarPincushionWithCurveArrows2DGraphLayouter.prototype = new BaseGraphLayouter();
// correct the constructor pointer because it points to BaseGraphLayouter
StackedBarPincushionWithCurveArrows2DGraphLayouter.prototype.constructor = StackedBarPincushionWithCurveArrows2DGraphLayouter;