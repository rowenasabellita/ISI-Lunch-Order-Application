import React, { useState, useEffect, useMemo } from "react";
import TableContainer from "./components/TableContainer";
import TableContainerTwo from "./components/TableContainerTwo";
import { orderBy } from "@progress/kendo-data-query";
import { Button } from "react-bootstrap";
import axios from "axios";
import weeklyCSS from "./Weeklyreport.module.css";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import { Grid, GridColumn } from "@progress/kendo-react-grid";

const getDefaultDates = () => {
    const date = new Date();
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let firstDateOfMonth = new Date(year, month, 1).getDate();
  
    firstDateOfMonth =
      firstDateOfMonth < 10 ? "0" + firstDateOfMonth : firstDateOfMonth;
    month = month < 10 ? "0" + month : month;
  
    const startDate = `${year}-${month}-${firstDateOfMonth}`;
    const endDate = date.toISOString().substr(0, 10);
  
    return {
      startDate,
      endDate
    };
};

const Weeklyreport = () => {
  const [firstTableDate, setFirstTableDate] = useState ([])
  const [secondTableDate, setSecondTableDate] = useState ([])
  const [supplier, setSupplier] = useState ([])
  const [data, setData] = useState([])
  const [grandTotal, setGrandTotal] = useState([])
 
  
  const getDefaultDateValues = getDefaultDates();
  const [defaultDates, setDates] = useState(getDefaultDateValues);
  const setDateValues = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setDates((prev_state) => ({
      ...prev_state,
      [name]: value
    }));
  };

  const firstColumns = useMemo(
    () => [
      {
        Header: "Name",
        title: "Name",
        accessor: "order_id.employee_name",
      },
      {
        Header: "Date",
        title: "Date",
        accessor: "order_id.order_date",
      },
    ],
    []
  );

  const secondColumns = useMemo(
    () => [
      {
        Header: "Date",
        accessor: "date",
      },
      {
        Header: "Number of Employees",
        accessor: "number_of_employees",
      },
      {
        Header: "Price",
        accessor: "price",
      },
      {
        Header: "Total Amount",
        accessor: "total_amount",
      },
    ],
    []
  );

  useEffect(async () => {
      const { data } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/supplier/`)
      if (data) {
        setData(data)
        setSupplier(data[0].id);
      }
  }, [])

  useEffect(async() => {
    handleGo(); 
  }, [supplier])

  const handleGo = async () => {
    const {data: sup} = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/order/search/by_supplier/${supplier}/${defaultDates.startDate}/${defaultDates.endDate}/`)
    if (sup) { 
      setFirstTableDate(sup)
    }

    const { data: orderSummaryData } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/order_summary/search/by_supplier/${supplier}/${defaultDates.startDate}/${defaultDates.endDate}/`)
    setSecondTableDate(orderSummaryData)

    const {data: total } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/order_summary/grand_total/by_supplier/${supplier}/${defaultDates.startDate}/${defaultDates.endDate}/`)
    setGrandTotal(total[0])
  }


  const firstsort= firstTableDate.sort((a,b)=> b.order_id.order_date.localeCompare(a.order_id.order_date))
  const secondsort= secondTableDate.sort((a,b)=> b.date.localeCompare(a.date))
  class App extends React.Component {
    _export;
    export = () => {
      const optionsGridOne = this._exportGridOne.workbookOptions();
      const optionsGridTwo = this._exportGridTwo.workbookOptions();
      const optionsGridThree = this._exportGridThree.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[2] = optionsGridThree.sheets[0];
      optionsGridOne.sheets[0].title = "Employee Orders Name";
      optionsGridOne.sheets[1].title = "Accounting Sheet";
      optionsGridOne.sheets[2].title = "Grand Total";
      this._exportGridOne.save(optionsGridOne,optionsGridTwo,optionsGridThree);
    };
    render() {
      return (
        <div>
          <ExcelExport
            data={firstsort}
            ref={(exporter) => {
              this._exportGridOne = exporter;
            }}
            fileName={`Weekly Report`}
          >
                <Button
                variant="success"
                  title="Export PDF"
                  className="k-button k-primary"
                  onClick={this.export}
                >
                  Export to Excel
                </Button>
            <Grid data={firstsort} style={{ height: "490px", display:"none"}} resizable={true}>
                <GridColumn field="order_id.employee_name" title="Employee Name" width="150px"/> 
                <GridColumn field="order_id.order_date" title="Date" /> 
            </Grid>
          </ExcelExport>
  
          <ExcelExport
            data={secondsort}
            ref={(exporter) => {
              this._exportGridTwo = exporter;
            }}
          >
                 <button
                  title="Export PDF"
                  className="k-button k-primary"
                  onClick={this.export}
                  style={{display: "none"}}
                >
                  Export to Excel
                </button>
            <Grid data={secondsort} style={{ height: "490px", display: "none"}} resizable={true}>
                <GridColumn field="date" title="Date" />
                <GridColumn field="number_of_employees" title="Number of Employees" width="150px" /> 
                <GridColumn field="price" title="Price" /> 
                <GridColumn field="total_amount" title="Total Amount" />
            </Grid>
          </ExcelExport>
          <ExcelExport
            data={[grandTotal]}
            ref={(exporter) => {
              this._exportGridThree = exporter;
            }}
          >
                 <button
                  title="Export PDF"
                  className="k-button k-primary"
                  onClick={this.export}
                  style={{display: "none"}}
                >
                  Export to Excel
                </button>
            <Grid data={[grandTotal]} style={{ height: "490px" , display: "none"}} resizable={true}>
                <GridColumn field="total_employees" title="Total Employees" width="120px" />
                <GridColumn field="price" title="Total Price" /> 
                <GridColumn field="grand_total" title="Grand Total" /> 
            </Grid>
          </ExcelExport>
        </div>
      );
    }
  }
  
  return (
    <div className={weeklyCSS.mainContainer}>
      <div className={weeklyCSS.container}>
        <div className={weeklyCSS.topContent}>
          <div className={weeklyCSS.leftContent}>
            <select 
              name="supplier" 
              value={supplier} 
              type="select" 
              onChange={(e) => setSupplier(e.target.value)}
            >
              {data.map((supplier, index) => (
                <option  key={index} value={supplier.id}>
                  {supplier.supplier_name + ""}      
                </option>
              ))}
            </select>
          </div>

          <div className={weeklyCSS.rightContent}>
            <App/>
          </div>
        </div>
        <div className={weeklyCSS.mainContent}>
          <div className={weeklyCSS.dateRange}> 
            <label>Start Date:</label>
            <input type="date" id="startDate" name="startDate" onChange={(e) => setDateValues(e)} value={defaultDates.startDate}/>
            <label>End Date:</label>
            <input type="date" id="endDate" name="endDate" onChange={(e) => setDateValues(e)} value={defaultDates.endDate} min={defaultDates.startDate}/>
            <Button className="btn btn-info" type="button" id="clickButton" onClick={handleGo} >Filter <i className='bx bx-filter-alt'/></Button>
          </div>
          <div className={weeklyCSS.content}>
            <div className={weeklyCSS.firstContent}>
              <div className={weeklyCSS.firstTable}>
                <TableContainer
                  columns={firstColumns}
                  data={firstTableDate}
                />
              </div>
            </div>
            <div className={weeklyCSS.secondContent}>
              <div className={weeklyCSS.secondTable}>
                <TableContainerTwo
                    columns={secondColumns}
                    data={secondTableDate}
                    grandTotal={grandTotal}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weeklyreport;
