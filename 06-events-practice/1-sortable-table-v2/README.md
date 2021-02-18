# SortableTable v2 компонент без динамической загрузки данных

Необходимо модифицировать компонент "SortableTable" из предыдущего 
модуля [SortableTable v1](taskbook:dom-document-loading/sortable-table-v1) таким образом, 
чтобы сортировка таблицы происходила по клику на заголовок таблицы (сортировка осуществляется на клиенте)

!["SortableTable v1"](sortable-table-v2.gif)

Также необходимо добавить сортировку по умолчанию - т.е. таблица должна быть отображена в документе в отсортированном
состоянии по одной из колонок. Колонка по которой будет осуществлена сортировка данных должна быть заданы при создании
объекта таблицы. 

Также необходимо предусмотреть возможность задать "пользовательскую" сортировку, 
к примеру, по статусу заказа: "завершен", "новый". 