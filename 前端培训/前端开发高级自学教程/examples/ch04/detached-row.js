var table = document.getElementById('order-table');
var row = document.createElement('tr');
row.textContent = 'stock 8';
table.appendChild(row);
var keep = row;
row.remove();
var inDocument = document.contains(keep);
