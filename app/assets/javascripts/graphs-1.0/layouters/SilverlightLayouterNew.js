function SilverlightLayouterNew(graph) {
    this.Graph = graph;
    this.Boundary = 0.1;
    this.Padding = { Top: 160, Right: 40, Bottom: 40, Left: 40 };

    this.Layout = function () {

        //var cur_colors = new Array();
        //var color_match = false;
        var length = this.Graph.Nodes.length;
        var centerX = this.Graph.Width / 2;
        var centerY = this.Graph.Height / 2;
        var graphWidth = this.Graph.Width - this.Padding.Left - this.Padding.Right;
        var graphHeight = this.Graph.Height - this.Padding.Bottom - this.Padding.Top;
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
                case 2:
                    shape = this.FindOrCreateShape(node, node, GraphShapeTypes.Circle);
                    shape.Radius = Math.sqrt((node.Value) / pi) * multiplier;
                    shape.Width = Math.sqrt((node.Value)) * multiplier;
                    break;
                case 1:
                    shape = this.FindOrCreateShape(node, node, GraphShapeTypes.Rect);
                    shape.Height = Math.sqrt((node.Value) * 1.2) * multiplier;
                    shape.Width = Math.sqrt((node.Value) * 1.2) * multiplier;
                    shape.Other.rx = 1;
                    shape.Other.ry = 1;
                    shape.Other.rotationDegrees = '';
                    break;
                case 3:
                    shape = this.FindOrCreateShape(node, node, GraphShapeTypes.Triangle);
                    shape.Height = node.Value * multiplier;
                    shape.Width = node.Value * multiplier;
                    break;
            }

            shape.X = (graphWidth * node.X) + this.Padding.Left;
            shape.Y = (graphHeight * node.Y) + this.Padding.Top;
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
            label.Color = node.Label.Color; // "#ffffff"; // shape.Color;

            label.Other.rotationDegrees = 0;
            label.Other.diffX = 6 + shape.Width / 2;

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
            var curve = this.FindOrCreateShape(conn, node, GraphShapeTypes.CurveArrow);

            if (conn.ArrowDirection == null) { conn.ArrowDirection = ArrowDirections.Outbound; }

            curve.ArrowDirection = conn.ArrowDirection;

            curve.StrokeWidth = conn.StrokeWidth * 2;
            curve.HeadOffset = (conn.Node2.Shapes[0].Width + 5) / 2;
            curve.HeadSize = 10;

            curve.X2 = conn.Node2.Shapes[0].X;
            curve.Y2 = conn.Node2.Shapes[0].Y;
                        
            curve.X1 = conn.Node1.Shapes[0].X;
            curve.Y1 = conn.Node1.Shapes[0].Y;

            curve.CX = conn.Node1.Shapes[0].X;
            curve.CY = conn.Node1.Shapes[0].Y;

            if (conn.Node1.Shapes[0].Type == GraphShapeTypes.Rect) {
                //curve.Y1 += conn.Node1.Shapes[0].Height / 2;
            }

            if (conn.Node2.Shapes[0].Type == GraphShapeTypes.Rect) {
                curve.Y2 += conn.Node2.Shapes[0].Height / 2;
            }


            //            //add marker
            //            var marker = new GraphMarker(this.Graph, "arrowMarker-" + i, conn.StrokeWidth, 2, 10, 10);
            //            this.Graph.Markers.push(marker);
            //            
            //            var triangle = this.FindOrCreateShape(marker, marker, GraphShapeTypes.Triangle);

            //            triangle.X1 = 0;
            //            triangle.Y1 = 0;
            //            triangle.X2 = 4;
            //            triangle.Y2 = 2;
            //            triangle.X3 = 0;
            //            triangle.Y3 = 4;

            //            triangle.Color = conn.StrokeColor;


            //            var line = this.FindOrCreateShape(conn, node, GraphShapeTypes.Line);

            //            line.StrokeWidth = conn.StrokeWidth * 2;

            //            line.X1 = conn.Node1.Shapes[0].X;
            //            line.Y1 = conn.Node1.Shapes[0].Y;

            //            line.X2 = conn.Node2.Shapes[0].X;
            //            line.Y2 = conn.Node2.Shapes[0].Y;

            //            if (conn.Node1.Shapes[0].Type == GraphShapeTypes.Rect) {
            //                line.Y1 += conn.Node1.Shapes[0].Height / 2;
            //            }

            //            if (conn.Node2.Shapes[0].Type == GraphShapeTypes.Rect) {
            //                line.Y2 += conn.Node2.Shapes[0].Height / 2;
            //            }

            //            if (conn.ArrowDirection == null) { conn.ArrowDirection = ArrowDirections.Outbound; }

            //            switch (conn.ArrowDirection) {
            //                case ArrowDirections.Inbound: line.MarkerStartId = marker.Id; break
            //                case ArrowDirections.Outbound: line.MarkerEndId = marker.Id; break
            //                case ArrowDirections.Both: line.MarkerStartId = marker.Id; line.MarkerEndId = marker.Id; break
            //            }
        }
    };

};

// inherit BaseGraphLayouter
SilverlightLayouterNew.prototype = new BaseGraphLayouter();
// correct the constructor pointer because it points to BaseGraphLayouter
SilverlightLayouterNew.prototype.constructor = SilverlightLayouterNew;