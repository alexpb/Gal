function GraphTitle(graph) {
    this.Graph = graph;
    this.Container = null;
    this.Options = { ShowAsHtml: false };
    this._title = null;

    //create the div element for the title
    this._Create = function () {
        //set the graph container position in order to display the nav toolbar into it's coordinate system
        $(this.Graph.Container).css({ position: 'relative' });

        //create title container        
        this.Container = $('<div id="graph-title" class="graph-title"></div>')
            .appendTo($(this.Graph.Container)).hide();       
    };

    this.SetTitle = function (title) {
        this._title = title;

        if (this.Container == null) { this._Create(); }

        if (this._title != null && this._title != '') {
            if (this.Options.ShowAsHtml == true) {
                this.Container.html(this._title).show();
            } else {
                this.Container.text(this._title).show();
            }
        }
    };

    this.GetTitle = function (title) {
        return this._title;
    };
};

function GraphSubTitle(graph) {
    GraphTitle.call(this, graph);

    //create the div element for the title
    this._Create = function () {
        //set the graph container position in order to display the nav toolbar into it's coordinate system
        $(this.Graph.Container).css({ position: 'relative' });

        //create title container        
        this.Container = $('<div id="graph-sub-title" class="graph-sub-title"></div>')
            .appendTo($(this.Graph.Container)).hide();
    }; 
}

// inherit GraphTitle
GraphSubTitle.prototype = new GraphTitle();
// correct the constructor pointer because it points to GraphTitle
GraphSubTitle.prototype.constructor = GraphSubTitle;