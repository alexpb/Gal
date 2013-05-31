function SilverlightLayouter(graph) {
    this.Graph = graph;
    this.Boundary = 0.1;

    this.Layout = function () {

        //var cur_colors = new Array();
        //var color_match = false;
        var length = this.Graph.Nodes.length;
        var centerX = this.Graph.Width / 2;
        var centerY = this.Graph.Height / 2;
        var totalValue = 0;
        var pi = 3.14;
        //var shapes = [GraphShapeTypes.Circle, GraphShapeTypes.Rect, GraphShapeTypes.Triangle];

        for (var i = 0; i < length; i++) {
            /* if (labelHeight != null || this.Graph.Nodes[i].Label == null) {

            //create a temp span in order to calculate the size (BBox) of the label
            var spanBBox = $('<span/>').appendTo(this.Graph.Container).hide().text(this.Graph.Nodes[i].Label.Text).css('font-size', this.Graph.Nodes[i].Label.FontSize);

            labelHeight = spanBBox.width();

            //remove the temp span
            spanBBox.remove();
            }
            if (this.Graph.Nodes[i].Value + labelHeight > maxValue) { maxValue = this.Graph.Nodes[i].Value + labelHeight; }*/
            totalValue += this.Graph.Nodes[i].Value;
            // labelHeight = 0;
        }

        var multiplier = 8;

        //set nodes layout
        for (var i = 0; i < length; i++) {

            var node = this.Graph.Nodes[i];
            var shape;

            switch (node.SilverShape) {
                case 1:
                    shape = this.FindOrCreateShape(node, node, GraphShapeTypes.Circle);
                    shape.Radius = Math.sqrt((node.Value) / pi) * multiplier;
                    shape.Width = Math.sqrt((node.Value)) * multiplier;
                    break;
                case 2:
                    shape = this.FindOrCreateShape(node, node, GraphShapeTypes.Rect);
                    shape.Height = Math.sqrt((node.Value) * 1.2) * multiplier;
                    shape.Width = Math.sqrt((node.Value) * 1.2) * multiplier;
                    shape.Other.rx = 1;
                    shape.Other.ry = 1;
                    break;
                case 3:
                    shape = this.FindOrCreateShape(node, node, GraphShapeTypes.Triangle);
                    shape.Height = node.Value * multiplier;
                    shape.Width = node.Value * multiplier;
                    break;
            }

            shape.X = graph.Width * (this.Boundary) + graph.Width * (1 - this.Boundary * 2) * node.X;
            shape.Y = graph.Height * (this.Boundary) + graph.Height * (1 - this.Boundary * 2) * node.Y;
            shape.Color = node.Color;
            /*
            for (var a = 0; a < cur_colors.length; a++) {
            if (node.Color == cur_colors[a]) {
            shape.Color = colors[a];
            color_match = true;
            }
            }
            if (color_match == false) {
            shape.Color = colors[cur_colors.length];
            cur_colors[cur_colors.length] = node.Color;
            }
            color_match = false;
            //shape.Color = node.Color;
            */
            shape.StrokeColor = shape.Color; // node.StrokeColor;

            //add label
            if (node.Label == null) { continue; }

            var label = this.FindOrCreateShape(node, node, GraphShapeTypes.Label);

            label.Text = node.Label.Text;
            label.FontSize = node.Label.FontSize;
            label.X = shape.X + 6 + shape.Width / 2;
            label.Y = shape.Y;
            //alert(shape.Label.Color);
            label.Color = node.Label.Color; // "#ffffff"; // shape.Color;

            label.Other.rotationDegrees = 0;
            label.Other.diffX = 6 + shape.Width / 2;
            //alert(shape.Type);
            if (shape.Type == 20) {
                label.Other.diffY = shape.Height / 2 + 4;
            } else {
                label.Other.diffY = 4;
            }

            label.Y += label.Other.diffY;
        }

        var connLength = this.Graph.Connections.length;

        //set connections layout
        for (var i = 0; i < connLength; i++) {
            var conn = this.Graph.Connections[i];
            conn.StrokeColor = '#888';
            var curve = this.FindOrCreateShape(conn, node, GraphShapeTypes.CurveArrow);

            curve.StrokeWidth = conn.StrokeWidth;

            var node2DiffX = 0;
            var node2DiffY = 0;

            if (conn.Node1.Shapes[0].X >= conn.Node2.Shapes[0].X) {
                node2DiffX = conn.Node1.Shapes[0].X - conn.Node2.Shapes[1].Width; // -shape.Width;
            } else {
                node2DiffX = conn.Node2.Shapes[0].X - conn.Node2.Shapes[1].Width; // -shape.Width;
            }

            if (conn.Node1.Shapes[0].Y >= conn.Node2.Shapes[0].Y) {
                node2DiffY = conn.Node1.Shapes[0].Y - conn.Node2.Shapes[1].Width; // -shape.Width;
            } else {
                node2DiffY = conn.Node2.Shapes[0].Y - conn.Node2.Shapes[1].Width;
            }

            curve.X2 = conn.Node1.Shapes[0].X; //node2DiffX;
            curve.Y2 = conn.Node1.Shapes[0].Y; //node2DiffY;

            curve.X1 = conn.Node2.Shapes[0].X;
            curve.Y1 = conn.Node2.Shapes[0].Y;

            curve.CX = conn.Node2.Shapes[0].X;
            curve.CY = conn.Node2.Shapes[0].Y;
        }
    };

};

// inherit BaseGraphLayouter
SilverlightLayouter.prototype = new BaseGraphLayouter();
// correct the constructor pointer because it points to BaseGraphLayouter
SilverlightLayouter.prototype.constructor = SilverlightLayouter;