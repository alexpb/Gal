function GraphNavToolbar(graph) {
    this.Graph = graph;
    this.Container = null;
    //this.HAlign = hAlign;
    //this.VAlign = vAlign;

    //create the div element for the tooltip
    this._Create = function () {
        //set the graph container position in order to display the nav toolbar into it's coordinate system
        $(this.Graph.Container).css({ position: 'relative' });

        //create nav toolbar container        
        this.Container = $('<div id="graph-nav" class="graph-nav"></div>')
            .appendTo($(this.Graph.Container));

        //Full screen
        $('<div id="graph-nav-full-screen" class="graph-nav-tool graph-nav-full-screen" title="Full screen"></div>')
            .appendTo($(this.Container))
            .bind('click', { graph: this.Graph }, function (event) {
                //var trigger = event.target.trigger;
                //if (trigger !== undefined) { trigger.GraphShape.GraphNode.Graph.Tooltip.Hide(); }

                //todo: move this to renderer
                var svg = $(event.data.graph.Container).svg('get');

                $(event.data.graph.Container).width(500).height(600);
                //svg.configure({ viewBox: '0 0 ' + 500 + ' ' + 600, preserveAspectRatio: 'xMaxyMax' }, true);
            });

        //add pan controls
        var panTools = $('<div id="graph-nav-pan" class="graph-nav-pan"></div>').appendTo($(this.Container));

        $('<div id="graph-nav-pan-up-left" class="graph-nav-tool graph-nav-pan-up-left" title="Pan up and left"></div>').appendTo($(panTools)).get(0)._PanDirection = 'up-left';
        $('<div id="graph-nav-pan-up" class="graph-nav-tool graph-nav-pan-up" title="Pan up">&uarr;</div>').appendTo($(panTools)).get(0)._PanDirection = 'up';
        $('<div id="graph-nav-pan-up-right" class="graph-nav-tool graph-nav-pan-up-right" title="Pan up and right"></div>').appendTo($(panTools)).get(0)._PanDirection = 'up-right';
        $('<div id="graph-nav-pan-left" class="graph-nav-tool graph-nav-pan-left" title="Pan left">&larr;</div>').appendTo($(panTools)).get(0)._PanDirection = 'left';

        $('<div id="graph-nav-pan-home" class="graph-nav-tool graph-nav-pan-home" title="Return to the begining"></div>')
            .appendTo($(panTools))
            .bind('click', { graph: this.Graph }, function (event) {
                event.data.graph.Renderer.Pan('home');
            });

            $('<div id="graph-nav-pan-right" class="graph-nav-tool graph-nav-pan-right" title="Pan right">&rarr;</div>').appendTo($(panTools)).get(0)._PanDirection = 'right';
        $('<div id="graph-nav-pan-down-left" class="graph-nav-tool graph-nav-pan-down-left" title="Pan down and left"></div>').appendTo($(panTools)).get(0)._PanDirection = 'down-left';
        $('<div id="graph-nav-pan-down" class="graph-nav-tool graph-nav-pan-down" title="Pan down">&darr;</div>').appendTo($(panTools)).get(0)._PanDirection = 'down';
        $('<div id="graph-nav-pan-down-right" class="graph-nav-tool graph-nav-pan-down-right" title="Pan down and right"></div>').appendTo($(panTools)).get(0)._PanDirection = 'down-right';

        panTools.find('.graph-nav-pan-up-left, .graph-nav-pan-up, .graph-nav-pan-up-right, .graph-nav-pan-left, .graph-nav-pan-right, .graph-nav-pan-down-left, .graph-nav-pan-down, .graph-nav-pan-down-right')
            .bind('mousedown', { graph: this.Graph }, function (event) {
                this._PanningIntervalId = window.setInterval(function () { event.data.graph.Renderer.Pan(event.target._PanDirection); }, 55);
            })
            .bind('mouseup', { graph: this.Graph }, function (event) {
                window.clearInterval(this._PanningIntervalId);
            });

        //add zoom controls
        var zoomTools = $('<div id="graph-nav-zoom" class="graph-nav-zoom"></div>').appendTo($(this.Container));
        $('<div id="graph-nav-zoom-in" class="graph-nav-tool graph-nav-zoom-in" title="Zoom in">+</div>').appendTo($(zoomTools)).get(0)._ZoomType = 'zoom-in';
        $('<div id="graph-nav-zoom-out" class="graph-nav-tool graph-nav-zoom-out" title="Zoom out">-</div>').appendTo($(zoomTools)).get(0)._ZoomType = 'zoom-out';

        zoomTools.find('.graph-nav-zoom-in, .graph-nav-zoom-out')
            .bind('mousedown', { graph: this.Graph }, function (event) {                
                this._ZoomingIntervalId = window.setInterval(function () { event.data.graph.Renderer.Zoom(event.target._ZoomType); }, 70);
            })
            .bind('mouseup', { graph: this.Graph }, function (event) {
                window.clearInterval(this._ZoomingIntervalId);
            });
            
    };

    this._Create();
    
};