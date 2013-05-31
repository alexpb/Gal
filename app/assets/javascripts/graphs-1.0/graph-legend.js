function GraphLegend(graph) {
    this.Graph = graph;
    this.Container = null;
    this.Options = { DataSeries: { ShowEmpty: true, ShowNodesCount: true} };

    //create the div element for the tooltip
    this._Create = function () {
        //set the graph container position in order to display the nav toolbar into it's coordinate system
        $(this.Graph.Container).css({ position: 'relative' });

        //create legend container        
        this.Container = $('<div id="graph-legend" class="graph-legend"></div>')
            .appendTo($(this.Graph.Container));       
    };

    this._Create();

    this.Render = function () {
        this._RenderDataSeries(this.Graph.DataSeries, this.Container);
    };

    this._RenderDataSeries = function (dataSeries, parentContainer) {

        var ul = $('<ul></ul>').appendTo($(parentContainer));

        var length = dataSeries.length;

        //add legend items
        for (var i = 0; i < length; i++) {
            var dataSerie = dataSeries[i];

            //if (this.Options.DataSeries.ShowEmpty == false && dataSerie.Nodes.length <= 0 && dataSerie.DataSeries.length <= 0) { continue; }
            if (this.Options.DataSeries.ShowEmpty == false && dataSerie.NodesCount() <= 0) { continue; }

            var li = $('<li />').text(dataSerie.Label.Text + (this.Options.DataSeries.ShowNodesCount ? ' (' + dataSerie.NodesCount() + ')' : ''));
            var span = $('<span />').prependTo($(li)).css({ 'background-color': dataSerie.Color, 'width': '10px', 'height': '10px' }).html('&nbsp;');

            li.bind('click', { graph: this.Graph, dataSerie: dataSerie }, function (event) {
                //this._ZoomingIntervalId = window.setInterval(function () { event.data.graph.Renderer.Zoom(event.target._ZoomType); }, 70);
                if (this._Visible == undefined) { this._Visible = true; }

                this._Visible = !this._Visible;

                event.data.graph.Renderer.ShowHideDataSerie(event.data.dataSerie, this._Visible);

                $(this).css('opacity', (this._Visible ? 1 : 0.5));

                event.stopPropagation();                
            })

            if (dataSerie.DataSeries.length > 0) { this._RenderDataSeries(dataSerie.DataSeries, li); }

            li.appendTo($(ul));
        }
    };

    this._GetDataSeries = function (dataSeries, parentContainer) {
    };
};