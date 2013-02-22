(function( $, window ) {

  'use strict';

  var defaults = {
    offset: { top: 0, left: 0 },
    scrollContainer : window,
    stickyCssClass : 'table-sticky-header',
    nonStickyCssClass : 'table-nonsticky-header',
    stickyColumns : 0,
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

  scrollHandler = function( e ) {
    var stickyheader = e.data,
        $scrollContainer;

    if ( stickyheader.$table.is( ':hidden' ) ) {
      return;
    }
    $scrollContainer = $( stickyheader.scrollContainer );
    stickyheader.refresh( { top: $scrollContainer.scrollTop(),
                            left: $scrollContainer.scrollLeft() } );
  },

  border = function( $elm, sides ) {
    sides = sides.split( ' ' );
    var size = 0;

    for ( var i = 0; i < sides.length; i++ ) {
      size += parseInt( $elm.css( 'border-' + sides[i] + '-width' ), 10 );
    }
    return size;
  };

  function StickyHeader( $elm, options ) {
    this.$table = $elm;
    $.extend( this, defaults, options );
  }

  StickyHeader.prototype = {

    // attach scroll handler
    stick : function() {
      this.initialize();
      $( this.scrollContainer ).on( 'scroll', this, scrollHandler );
    },

    // detach scroll handler
    unstick : function() {
      $( this.scrollContainer ).off( 'scroll', scrollHandler );
    },

    initialize : function() {
      var that = this;
      // create dummy table to use for sticky header
      this.$stickyTableHeader = $( '<table></table>' )
        .append( this.$table.find( 'thead' ).clone() )
        .css( $.extend( { 'top': this.offset.top }, stickyTableHeaderCss ) )
        .addClass( this.stickyCssClass ) // add class from options
        .addClass( this.$table.attr( 'class' ) ); // add class(es) from real table

      // create dummy table to use for sticky column
      this.$stickyTableColumn = $( '<table></table>' )
        .css( $.extend( { 'left':  this.offset.left, 'top':  this.offset.top },
                          stickyTableColumnCss ) )
        .addClass( this.stickyCssClass ) // add class from options
        .addClass( this.$table.attr( 'class' ) ); // add class(es) from real table

      var columnSelector = '';
      for ( var i = 0; i < this.stickyColumns; i++ ) {
        columnSelector += 'td:nth-child(' + (i+1) + '), th:nth-child(' + (i+1) + ')';
      }

      var $cells = $();
      this.$table.find( columnSelector ).clone().each( function( idx, td ) {
        $cells.add( $(td) );
        if ( idx % that.stickyColumns === 0 ) {
          var tr = $( '<tr></tr>' ).append( $cells );
          that.$stickyTableColumn.append( tr );
          console.log( tr );
          $cells = $();
        }
      } );

      // create dummy div for corner
      this.$corner = $( '<div></div>' ).css(
        $.extend( {
          'left':  this.offset.left,
          'top':  this.offset.top,
          'z-index': 1000 },
        stickyCornerCss ) );

      // mark real table
      this.$table
        .css( tableCss )
        .addClass( this.nonStickyCssClass );

      // insert "dummies" before real table
      this.$table
        .before( '<style>' +
          'table tr td, table tr th { ' +
          '  height: ' + this.cellHeight + 'px;' +
          '}</style>' )
        .before( this.$corner )
        .before( this.$stickyTableColumn )
        .before( this.$stickyTableHeader );

      // guesstimate the cellcount based on first row
      if ( this.cellCount === -1 ) {
        this.cellCount = this.$table.find( 'tbody tr:eq(0) td' ).length;
      }
      this.refreshWidths();
    },

    // refresh sticky header, called when ever user scrolls
    //
    // show/hide the sticky header as needed
    //
    // shows by sticky header by clone the table header and attaching the clone
    // to the stickyheader table
    //
    // hides by replacing the header into the table again - is needed to
    // support dom updates within the table headers whilst scrolling
    refresh : function( offset ) {
      var rawOffset = this.$table.offset(),
          tableOffSet = { top: rawOffset.top - this.offset.top,
                          left: rawOffset.left - this.offset.left },
          stickyHeaderHidden = this.$stickyTableHeader.is( ':hidden' ),
          stickyColumnHidden = this.$stickyTableColumn.is( ':hidden' ),
          cornerHidden = this.$corner.is( ':hidden' );

      offset.top = offset.top || $( this.scrollContainer ).scrollTop();
      offset.left = offset.left || $( this.scrollContainer ).scrollLeft();

      // turn on sticky header
      if ( offset.top >= tableOffSet.top && stickyHeaderHidden ) {
        this.$stickyTableHeader.show();
      }

      this.$stickyTableHeader.css( 'left', (offset.left * -1) + rawOffset.left );

      // turn off sticky header
      if ( offset.top < tableOffSet.top  && !stickyHeaderHidden ) {
        this.$stickyTableHeader.hide();
      }

      // turn on sticky column
      if ( offset.left > tableOffSet.left && stickyColumnHidden ) {
        this.$stickyTableColumn.show();
      }

      this.$stickyTableColumn.css( 'top', (offset.top * -1) + rawOffset.top );

      // turn off sticky column
      if ( offset.left <= tableOffSet.left  && !stickyColumnHidden ) {
        this.$stickyTableColumn.hide();
      }

      // show corner when both header and column are hidden
      if ( !this.$stickyTableHeader.is( ':hidden' ) &&
           !this.$stickyTableColumn.is( ':hidden' ) &&
           cornerHidden ) {
        this.$corner.show();
      }
      // hide corner when either header or column is visible
      if ( ( this.$stickyTableHeader.is( ':hidden' ) ||
             this.$stickyTableColumn.is( ':hidden' ) ) &&
           !cornerHidden ) {
        this.$corner.hide();
      }
    },

    refreshWidths: function( ) {
      var width = this.cellCount * this.cellWidth,
          stickyColumnWidth = this.stickyColumns * this.cellWidth,
          vertBorder = border( this.$stickyTableHeader, 'top bottom' ) +
                       border( this.$stickyTableHeader.find( 'td, th'), 'top bottom' ),

          horzBorder = border( this.$stickyTableHeader, 'left right' ) +
                       border( this.$stickyTableHeader.find( 'td, th'), 'left right' ),

          cssWidth = { 'max-width': width, 'min-width': width };

      this.$table.css( cssWidth );
      this.$stickyTableHeader.css( cssWidth );
      this.$stickyTableColumn.css( { 'max-width': stickyColumnWidth,
                                     'min-width': stickyColumnWidth } );
      this.$corner.css( { 'border': '1px solid #ddd',
                          'width': stickyColumnWidth-2,
                          'height': this.$stickyTableHeader.height()-1 } );
    }
  };

  // sticky-header - jquery extension
  // --------------------------------
  //
  // Fixes table headers to top of screen when scrolled out of focus.
  //
  // Usage:
  //
  //     $( '.mytable' ).stickyheader();
  //
  // Attaches it self to window.scroll, call unstick to detach:
  //
  //     $( '.mytable' ).stickyheader( 'unstick' );
  //
  // Options:
  //
  //     // offset to use for sticking top header - use if your header shouldn't be sticky a 0
  //     { offset: 0,
  //     // container to attach scroll to - use to scroll in div with overflow
  //       scrollContainer : window }
  //
  $.fn.stickyheader = function( method, options ) {
    // use method a options if methods is an object
    options = $.extend( {}, typeof method === 'object' ? method : options || {} );

    // use method if provide, else assume fix
    method = typeof method === 'string' ? method : 'stick';

    this.each( function() {
      var $this = $(this),
          stickyheader = $this.data( 'stickyheader' );

      // create and store fix header
      if ( !stickyheader ) {
        $this.data( 'stickyheader', ( stickyheader = new StickyHeader( $this, options ) ) );
      }
      // call specified method
      stickyheader[ method ]();
    } );
  };

  // attach FixHeader to $ to allow access to with using jquery plugin
  $.StickyHeader = StickyHeader;

} )( jQuery, window || {} );
