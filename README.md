#Sticky Table jQuery Plugin

Make header and a left column stick when scroll large tables.

## Usage
This basic usage will make the headers of the table stick.

```javascript
$('table').sticky();
```

This will attach an event handler to the `window.scroll` to detach that call

```javascript
$('table').sticky('unstick');
```

To get sticky columns must specify how many columns to stick, the following
example will stick the first 2 columns

```javascript
$('table').sticky( {columnCount: 2} );
```

## Options
The sticky plugin supports the following options

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Default</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>offset</td>
      <td>{ top: 0, left: 0 }</td>
      <td>Offset of fixed top and fixed left position. Specify these to change where the fixed header and column will start.

      Offset may be specified as an array, like so: <code>[{width:900, top:0, left:0}, {top:40,left:0}]</code>.
      This will make the stickyheader responsive, so that top:0 is used in windows widths smaller than 900 and top:40 as default.
      </td>
    </tr>
    <tr>
      <td>scrollContainer</td>
      <td>window</td>
      <td>Which container should scroll. </td>
    </tr>
    <tr>
      <td>headerCssClass</td>
      <td>'sticky-header'</td>
      <td>css class of the sticky header</td>
    </tr>
    <tr>
      <td>columnCssClass</td>
      <td>'sticky-column'</td>
      <td>css class of the sticky column</td>
    </tr>
    <tr>
      <td>cornerCssClass</td>
      <td>'sticky-corner'</td>
      <td>css class of the sticky corner</td>
    </tr>
    <tr>
      <td>columnCount</td>
      <td>0</td>
      <td>How many columns should stick</td>
    </tr>
    <tr>
      <td>cellWidth</td>
      <td>60</td>
      <td>How wide are the cells</td>
    </tr>
    <tr>
      <td>cellHeight</td>
      <td>20</td>
      <td>How tall are the cells</td>
    </tr>
    <tr>
      <td>cellCount</td>
      <td>-1</td>
      <td>How many cells are there in a row. Will be calculated based on first row if -1</td>
    </tr>
  </tbody>
</table>

## Limitations
The table cells must have a fixed width and height. That can be specified with the
`cellWidth` and `cellHeight` options.

The table cannot change position, e.g. get more margin after `.sticky` function has been applied.