(function( $, window ) {

  'use strict';

  var defaults = {
    offset: { top: 0, left: 0 },
    scrollContainer : window,
    headerCssClass : 'sticky-header',
    columnCssClass : 'sticky-column',
    cornerCssClass : 'sticky-corner',
    tableCssClass: 'table-non-sticky',
    columnCount : 0,
    cellWidth : 60,
    cellHeight: 20,
    cellCount : -1
  },

  tableCss = { 'table-layout': 'fixed' },
  stickyTableHeaderCss = $.extend( { 'position': 'fixed',
                                     'margin-bottom':'0px',
                                     'background-color':'white',
                                     'display': 'none' }, tableCss ),

  stickyTableColumnCss = $.extend( { 'position': 'fixed',
                                     'background-color': 'white',
                                     'display': 'none' }, tableCss ),

  stickyCornerCss = $.extend( { 'position': 'fixed',
                                'background-color':'white',
                                'display': 'none' }, tableCss ),

  // event handler attached to scroll event,
  // will call StickyHeader.refresh with appropriate arguments
  scrollHandler = function( e ) {
    var stickytable = e.data,
        $scrollContainer;

    if ( stickytable.$table.is( ':hidden' ) ) {
      return;
    }
    $scrollContainer = $( stickytable.scrollContainer );
    stickytable.refresh( { top: $scrollContainer.scrollTop(),
                           left: $scrollContainer.scrollLeft() } );
  },

  // Helper for calculating the border widths.
  //
  // Usage: border( $elm, 'top bottom' );
  //   returns the width of the top and bottom
  border = function( $elm, sides ) {
    sides = sides.split( ' ' );
    var size = 0;

    for ( var i = 0; i < sides.length; i++ ) {
      size += parseInt( $elm.css( 'border-' + sides[i] + '-width' ), 10 );
    }
    return size;
  };

  // StickyTable constructor function
  function StickyTable( $elm, options ) {
    this.$table = $elm;
    $.extend( this, defaults, options );
  }

  StickyTable.prototype = {

    // attach scroll handler
    stick : function() {
      this.initialize();
      $( this.scrollContainer ).on( 'scroll', this, scrollHandler );
      $( this.scrollContainer ).on( 'resize', this, scrollHandler );
    },

    // detach scroll handler
    unstick : function() {
      $( this.scrollContainer ).off( 'scroll', scrollHandler );
      $( this.scrollContainer ).off( 'resize', scrollHandler );
    },
    
     remove: function() {
      this.unstick();
      this.$stickyTableHeader.remove();
      this.$stickyTableColumn.remove();
      this.$stickyTableCorner.remove();
      this.$table.removeClass( this.tableCssClass );
      delete this.$table.data().sticky;
    },

    // create sticky header, by clone thead of table
    createHeader : function() {
      // create dummy table to use for sticky header
      return $( '<table></table>' )
        .append( this.$table.find( 'thead' ).clone() )
        .css( $.extend( { 'top': this.offset.top }, stickyTableHeaderCss ) )
        .addClass( this.headerCssClass ) // add class from options
        .addClass( this.$table.attr( 'class' ) ); // add class(es) from real table
    },

    // create sticky column, by cloning first this.columnCount tds from table
    createColumn : function() {
      var that = this,
          // create dummy table to use for sticky column
          $column = $( '<table></table>' )
            .css( $.extend( { 'left':  this.offset.left, 'top':  this.offset.top },
                              stickyTableColumnCss ) )
            .addClass( this.columnCssClass ) // add class from options
            .addClass( this.$table.attr( 'class' ) ),  // add class(es) from real table
          columnSelector = [], // jQuery selector for selecting columns to copy
          $cells, // selected tds and ths
          cells = [], // cloned cells
          i;

      for ( i = 0; i < this.columnCount; i++ ) {
        columnSelector.push( 'td:nth-child(' + (i+1) + '), th:nth-child(' + (i+1) + ')' );
      }

      $cells = this.$table.find( columnSelector.join(',') );

      for ( i = 0; i < $cells.length; i++ ) {
        var td = $cells[i];
        cells.push( '<td colspan="' + td.colSpan + '" class="' + td.className + '">' + td.innerHTML + '</td>' );

        // skip columns when colspan is specified
        i += td.colSpan - 1;

        if ( i % that.columnCount === that.columnCount-1 ) {
          $column.append( '<tr>' + cells.join('') + '</tr>' );
          cells = [];
        }
      }
      return $column;
    },

    // create a div element that acts as a corner
    createCorner : function() {
      // create dummy div for corner
      return $( '<div></div>' ).css(
        $.extend( {
          'left':  this.offset.left,
          'top':  this.offset.top,
          'z-index': 1000 },
        stickyCornerCss ) )
      .addClass( this.cornerCssClass );
    },

    // Initialize sticky header, creates $stickyTableHeader, $stickyTableColumn
    // and $stickyTableCorner which are the tables that are actually sticked to
    // the top and left of the screen.
    initialize : function() {
      this.$stickyTableHeader = this.createHeader();
      this.$stickyTableColumn = this.createColumn();
      this.$stickyTableCorner = this.createCorner();

      this.$table.addClass( this.tableCssClass );
      
      // mark real table
      this.$table.css( tableCss );

      // insert "dummies" before real table
      this.$table
        .before( '<style>' +
          'table tr td, table tr th { ' +
          '  height: ' + this.cellHeight + 'px;' +
          '}</style>' )
        .before( this.$stickyTableCorner )
        .before( this.$stickyTableColumn )
        .before( this.$stickyTableHeader );

      // guesstimate the cellcount based on first row
      if ( this.cellCount === -1 ) {
        this.cellCount = this.$table.find( 'tbody tr:eq(0) td' ).length;
      }
      this.refreshWidths();
    },

    // refresh sticky table, called when ever user scrolls
    //
    // show/hide the sticky header as needed
    refresh : function( offset ) {
      var rawOffset = this.$table.offset(),
          tableOffSet = { top: rawOffset.top - this.offset.top,
                          left: rawOffset.left - this.offset.left },
          headerHidden = this.$stickyTableHeader.is( ':hidden' ),
          columnHidden = this.$stickyTableColumn.is( ':hidden' ),
          cornerHidden = this.$stickyTableCorner.is( ':hidden' );

      offset.top = offset.top || $( this.scrollContainer ).scrollTop();
      offset.left = offset.left || $( this.scrollContainer ).scrollLeft();

      // turn on sticky header
      if ( offset.top >= tableOffSet.top && headerHidden ) {
        this.$stickyTableHeader.show();
      }

      this.$stickyTableHeader.css( 'left', (offset.left * -1) + rawOffset.left );

      // turn off sticky header
      if ( offset.top < tableOffSet.top  && !headerHidden ) {
        this.$stickyTableHeader.hide();
      }

      // turn on sticky column
      if ( offset.left > tableOffSet.left && columnHidden ) {
        this.$stickyTableColumn.show();
      }

      this.$stickyTableColumn.css( 'top', (offset.top * -1) + rawOffset.top );

      // turn off sticky column
      if ( offset.left <= tableOffSet.left  && !columnHidden ) {
        this.$stickyTableColumn.hide();
      }

      // recalculate visibility of header and column
      headerHidden = this.$stickyTableHeader.is( ':hidden' );
      columnHidden = this.$stickyTableColumn.is( ':hidden' );

      // show corner if both header and column are visible
      if ( !headerHidden && !columnHidden && cornerHidden ) {
        this.$stickyTableCorner.show();
      }
      // hide corner when either header and column are hidden
      if ( ( headerHidden || columnHidden ) && !cornerHidden ) {
        this.$stickyTableCorner.hide();
      }
    },

    refreshWidths: function( ) {
      var width = this.cellCount * this.cellWidth,
          stickyColumnWidth = this.columnCount * this.cellWidth,
          vertBorder = border( this.$stickyTableHeader, 'top bottom' ) +
                       border( this.$stickyTableHeader.find( 'td, th'), 'top bottom' ),
          horzBorder = border( this.$stickyTableHeader, 'left right' ) +
                       border( this.$stickyTableHeader.find( 'td, th'), 'left right' ),

          cssWidth = { 'max-width': width, 'min-width': width };

      this.$table.css( cssWidth );
      this.$stickyTableHeader.css( cssWidth );
      this.$stickyTableColumn.css( { 'max-width': stickyColumnWidth,
                                     'min-width': stickyColumnWidth } );
      this.$stickyTableCorner.css( { 'width': stickyColumnWidth-2,
                                     'height': this.$stickyTableHeader.height()-1 } );
    }
  };

  // sticky - jquery extension that makes tables stick
  // ---------------------------------------------------
  //
  // sticks table headers to top of screen
  //
  // Usage:
  //
  //     $( '.mytable' ).sticky();
  //
  // Attaches it self to window.scroll, call unstick to detach:
  //
  //     $( '.mytable' ).sticky( 'unstick' );
  //
  // Options:
  //
  //     // offset to use for sticking top header - use if your header shouldn't be sticky a 0
  //     { offset: 0,
  //     // container to attach scroll to - use to scroll in div with overflow
  //       scrollContainer : window }
  $.fn.sticky = function( method, options ) {
    // use method a options if methods is an object
    options = $.extend( {}, typeof method === 'object' ? method : options || {} );

    // use method if provide, else assume fix
    method = typeof method === 'string' ? method : 'stick';

    this.each( function() {
      var $this = $(this),
          stickytable = $this.data( 'sticky' );

      // create and store fix header
      if ( !stickytable ) {
        if ( method === 'remove' ) {
          return;
        }
        $this.data( 'sticky', ( stickytable = new StickyTable( $this, options ) ) );
      }
      // call specified method
      stickytable[ method ]();
    } );
  };
} )( jQuery, window || {} );
