import React from "react";
import filterCSS from "./Filter.module.css";
import { format } from 'date-fns'

export const Filter = ({ column }) => {
  return (
    <div style={{ marginTop: 5 }}>
      {column.canFilter && column.render("Filter")}
    </div>
  );
};

export const DefaultColumnFilter = ({
  column: {
    filterValue,
    setFilter,
    preFilteredRows: { length },
  },
}) => {
  return (
    <input
      className={filterCSS.hidden}
      value={filterValue || ""}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
      placeholder={`buscar (${length}) ...`}
    />
  );
};

export function dateBetweenFilterFn(rows, id, filterValues) {
  const sd = filterValues[0] ? format(new Date(filterValues[0]), 'yyyy/MM/dd') : undefined;
  const ed = filterValues[1] ? format(new Date(filterValues[1]), 'yyyy/MM/dd') : undefined;
  if (ed || sd) {
    return rows.filter((r) => {
      // format data
      var dateAndHour = r.values[id].split(" ");
      var [year, month, day] = dateAndHour[0].split("-");
      var date = [year, month, day].join("/");
      var formattedData = date;

      const cellDate = format(new Date(formattedData), 'yyyy/MM/dd');

      if (ed && sd) {
        return cellDate >= sd && cellDate <= ed;
      } else if (sd) {
        return cellDate >= sd;
      } else {
        return cellDate <= ed;
      }
    });
  } else {
    return rows;
  }
}

export function DateRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id },
}) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length
      ? format(new Date(preFilteredRows[0].values[id]), 'yyyy/MM/dd')
      : format(new Date(0), 'yyyy/MM/dd');
    let max = preFilteredRows.length
      ? format(new Date(preFilteredRows[0].values[id]), 'yyyy/MM/dd')
      : format(new Date(0), 'yyyy/MM/dd');

    preFilteredRows.forEach((row) => {
      const rowDate = format(new Date(row.values[id]), 'yyyy/MM/dd');

      min = rowDate <= min ? rowDate : min;
      max = rowDate >= max ? rowDate : max;
    });

    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <div className={filterCSS.container}>
      <input
        className={filterCSS.input}
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [val ? val : undefined, old[1]]);
        }}
        type="date"
        value={(filterValue[0]) || ""}
      />
      {" to: "}
      <input
        className={filterCSS.input}
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [
            old[0],
            val ? val.concat("T23:59:59.999Z") : undefined,
          ]);
        }}
        type="date"
        value={filterValue[1]?.slice(0, 10) || ""}
      />
    </div>
  );
}
