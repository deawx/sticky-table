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
      <td></td>
    </tr>
    <tr>
      <td>scrollContainer</td>
      <td>window</td>
      <td></td>
    </tr>
    <tr>
      <td>headerCssClass</td>
      <td>'sticky-header'</td>
      <td></td>
    </tr>
    <tr>
      <td>columnCssClass</td>
      <td>'sticky-column'</td>
      <td></td>
    </tr>
    <tr>
      <td>cornerCssClass</td>
      <td>'sticky-corner'</td>
      <td></td>
    </tr>
    <tr>
      <td>columnCount</td>
      <td>0</td>
      <td></td>
    </tr>
    <tr>
      <td>cellWidth</td>
      <td>60</td>
      <td></td>
    </tr>
    <tr>
      <td>cellHeight</td>
      <td>20</td>
      <td></td>
    </tr>
    <tr>
      <td>cellCount</td>
      <td>-1</td>
      <td></td>
    </tr>
  </tbody>
</table>

## Limitations
The table cells must have a fixed width and height. That can be specified with the
`cellWidth` and `cellHeight` options.

The table cannot change position, e.g. get more margin after `.sticky` function has been applied.