function SingleLine2DGraphLayouter(graph) {
    this.Graph = graph;
    this.NodeSpacing = 10;
    //this.GraphRadius = (this.Graph.Width > this.Graph.Height ? this.Graph.Height / 5 : this.Graph.Width / 5);

    this.Layout = function () {
        var length = this.Graph.Nodes.length;
        var centerX = this.Graph.Width / 2;
        var centerY = this.Graph.Height / 2;
        var maxValue = 0;
        var maxRadius = ((this.Graph.Width - (length * this.NodeSpacing)) / length) / 2;
        var labelHeight = null;

        //calculate maxValue and labelHeight for faster rendering later
        for (var i = 0; i < length; i++) {
            if (this.Graph.Nodes[i].Value > maxValue) { maxValue = this.Graph.Nodes[i].Value; }

            if (labelHeight != null || this.Graph.Nodes[i].Label == null) { continue; }

            //create a temp span in order to calculate the size (BBox) of the label
            var spanBBox = $('<span/>').appendTo(this.Graph.Container).hide().text(this.Graph.Nodes[i].Label.Text).css('font-size', this.Graph.Nodes[i].Label.FontSize);

            labelHeight = spanBBox.height();

            //remove the temp span
            spanBBox.remove();
        }

        if (labelHeight == null) { labelHeight = 10; }

        //set nodes layout
        for (var i = 0; i < length; i++) {
            var node = this.Graph.Nodes[i];

            //add circle shape
            var radius = (node.Value / maxValue) * maxRadius;
            var circle = this.FindOrCreateShape(node, node, GraphShapeTypes.Circle);

            circle.Radius = radius;
            circle.X = (radius * 2);
            if (i > 0) { circle.X = this.Graph.Nodes[i - 1].Shapes[0].X + (radius * 2) + this.NodeSpacing; }
            circle.Y = centerY;
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

            label.Other.rotationDegrees = 270;

            if (label.Other.rotationDegrees >= 0 && label.Other.rotationDegrees <= 180) {
                label.Other.transform = 'rotate(' + label.Other.rotationDegrees + ', ' + label.X + ', ' + label.Y + ')';
                label.Other.textAnchor = 'start';
                label.Other.diffX = (circle.Radius + 4);
                label.Other.diffY = (labelHeight / 3);
            } else {
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

            curve.CX = curve.X1 + (curve.X2 - curve.X1) / 2;
            curve.CY = curve.Y1 / 4;
        }
    };
};

// inherit BaseGraphLayouter
SingleLine2DGraphLayouter.prototype = new BaseGraphLayouter();
// correct the constructor pointer because it points to BaseGraphLayouter
SingleLine2DGraphLayouter.prototype.constructor = SingleLine2DGraphLayouter;