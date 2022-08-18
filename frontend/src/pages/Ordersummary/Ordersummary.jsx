import React, { useState } from "react";
import { MDBDataTable } from "mdbreact";
import { Button, Table, Spinner } from "react-bootstrap";
import orderCSS from "./Ordersummary.module.css";
import axios from "axios";
import { useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CSVLink, CSVDownload } from "react-csv";
import { ExcelExport, ExcelExportColumn } from "@progress/kendo-react-excel-export";
import { Grid, GridColumn, GridToolbar } from "@progress/kendo-react-grid";
  

const Ordersummary = () => {
  const today = new Date();
  const dateToday =
    today.getFullYear() +
    "-" +
    ("0" + parseInt(today.getMonth() + 1)).slice(-2) +
    "-" + 
    ("0" + today.getDate()).slice(-2);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState([]);
  const [isLoading, setLoading] = useState(false)
  const [orderSummary, setOrderSummary] = useState([]);
  const [disableSync, setDisableSync] = useState(false);
  const [updateSummary, setUpdatesummary] = useState([]);

  function timeout(delay) {
    return new Promise( res =>
      setTimeout(res, delay));
  }
  useEffect(async () => {
    try {
      const { data: userOrders } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/ordered_dish/${dateToday}`)
      setOrders(userOrders)

    } catch (err) {
      if (err.response.status) {
        toast.info('No Orders yet.', {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setDisableSync(true)
      }
    }

    try {
      const { data: getSummary } = await axios.get((`${process.env.REACT_APP_API_ENDPOINT}/ordered_dish/${dateToday}/summary_free`))
      setOrderSummary(getSummary)
      
      const items = getSummary.map(async (os) => {
        const postSummary = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/order_summary/`, {
          number_of_employees: os.number_of_employees,
          date: os.date,
          price: os.price,
          total_amount: os.amount,
          supplier: os.supplier
        }).catch(async(err) => {
          if (err.response.status == 400) {
              const orderSummaryId = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/order_summary/${dateToday}`)
              const update = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/order_summary/${orderSummaryId.data[0].id}/`, {
                number_of_employees: os.number_of_employees,
                date: os.date, 
                price: os.price,
                total_amount: os.amount,
                supplier: os.supplier
              })
              setLoading(true)
              await timeout(500);
              toast.success('Synced successfully!', {
              position: "top-center",
              autoClose: 1000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            setLoading(false)
            }
          })
          if(postSummary){
            setLoading(true)
            await timeout(500);
            toast.success('Synced successfully!', {
              position: "top-center",
              autoClose: 1000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            setLoading(false)
          }
        })
    } catch(err) {
        if (err.response.status == 400) {
          toast.info('No Orders yet.', {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          setDisableSync(true)
      }
    }

    const { data : totalCount } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/ordered_dish/${dateToday}/total_quantity_by_dish_type`)
    if(totalCount){
      setTotal(totalCount)
    }

  }, [])

  const data = [];
  
  orders.forEach(function (row) {
    const dish_info = {
      quantity: row['quantity'],
      remarks: row['remarks']
    }
    const order_id = row['order_id']['id'];

    if (!data.hasOwnProperty(order_id)) {
      data[order_id] = {
        name: row['employee_name'],
        main_dish: {},
        side_dish: {},
        extra: {}
      };
    }
      
    const dish_name = row['dish_name'];
    const order = data[order_id];
    const dish_type = row['dish_type'].toLowerCase().replace(' ', '_');
    
    if (order[dish_type].hasOwnProperty(dish_name)) {
      order[dish_type][dish_name].push(dish_info);

    } else {
      order[dish_type][dish_name] = [dish_info];
    }

  });

  let obj = []

  Object.values(data).map((item, idx) => {

    let dishes = [
      Object.keys(item.main_dish),
      Object.keys(item.side_dish),
      Object.keys(item.extra)
    ]
    let max_idx = dishes
        .map(a=>a.length)
        .indexOf(Math.max(...dishes.map(a=>a.length)));

    for (let i=0; i<dishes[max_idx].length; i++){
      
      let main = dishes[0]
      let side = dishes[1]
      let extra = dishes[2]
      
      let d = {
          name: item.name,
          main: "",
          qty_1: "",
          main_remarks: "",
          side: "",
          qty_2: "",
          side_remarks: "",
          extra: "",
          qty_3: "",
          extra_remarks: "",
      }

      try { d.main = main[i] } catch(err) {d.main = ""}
      try { d.qty_1 = item.main_dish[main[i]][0].quantity } catch (err) {d.qty_1 = ""}
      try { d.main_remarks = item.main_dish[main[i]][0].remarks } catch (err) {d.main_remarks = ""}

      try { d.side = side[i] } catch(err) {d.side = ""}
      try { d.qty_2 = item.side_dish[side[i]][0].quantity } catch (err) {d.qty_2 = ""}
      try { d.side_remarks = item.side_dish[side[i]][0].remarks } catch (err) {d.side_remarks = ""}

      try { d.extra = extra[i] } catch(err) {d.extra = ""}
      try { d.qty_3 = item.extra[extra[i]][0].quantity } catch (err) {d.qty_3 = ""}
      try { d.extra_remarks = item.extra[extra[i]][0].remarks } catch (err) {d.extra_remarks = ""}

      obj.push(d)
    }
  })
  
  const headers = {
    columns: [
      {
        label: "Name",
        field: "name",
        sort: "asc",
        width: 270,
      },
      {
        label: "Main Dish",
        field: "main",
        sort: "asc",
        width: 200,
      },
      {
        label: "Qty",
        field: "qty_1",
        sort: "asc",
        width: 200,
      },
      {
        label: "Remarks",
        field: "main_remarks",
        sort: "asc",
        width: 200,
      },
      {
        label: "Side Dish",
        field: "side",
        sort: "asc",
        width: 200,
      },
      {
        label: "Qty",
        field: "qty_2",
        sort: "asc",
        width: 200,
      },
      {
        label: "Remarks",
        field: "side_remarks",
        sort: "asc",
        width: 200,
      },
      {
        label: "Extra",
        field: "extra",
        sort: "asc",
        width: 200,
      },
      {
        label: "Qty",
        field: "qty_3",
        sort: "asc",
        width: 200,
      },
    ],

    rows: obj.map((item, idx) => {
      return item
    })
  };

  const handleSync = async () => {
    setLoading(true)
    const newData = orderSummary.map(async (os) => {
      const orderSummaryId = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/order_summary/${dateToday}`)
      const update = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/order_summary/${orderSummaryId.data[0].id}/`, {
        number_of_employees: os.number_of_employees,
        date: os.date, 
        price: os.price,
        total_amount: os.amount
      })
    })
    await timeout(500);
    toast.success('Synced successfully!', {
      position: "top-center",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    setLoading(false)
  }

  class App extends React.Component {
    _export;
    export = () => {
      const optionsGridOne = this._exportGridOne.workbookOptions();
      const optionsGridTwo = this._exportGridTwo.workbookOptions();
      optionsGridOne.sheets[1] = optionsGridTwo.sheets[0];
      optionsGridOne.sheets[0].title = "Employee Orders";
      optionsGridOne.sheets[1].title = "Order Summary";
      this._exportGridOne.save(optionsGridOne,optionsGridTwo);
    };
    render() {
      return (
        <div>
          <ExcelExport
            data={obj}
            ref={(exporter) => {
              this._exportGridOne = exporter;
            }}
            fileName={`OrderSummary ${dateToday}`}
          >
                <Button
                variant="success"
                  title="Export PDF"
                  className="k-button k-primary"
                  onClick={this.export}
                >
                  Export to Excel
                </Button>
            <Grid data={obj} style={{ height: "490px" , display: "none"}}>
                <GridColumn field="name" title="Employee Name" /> 
                <GridColumn field="main" title="Main Dish" /> 
                <GridColumn field="qty_1" title="Qty" /> 
                <GridColumn field="main_remarks" title="Remarks" />
                <GridColumn field="side" title="Side Dish" /> 
                <GridColumn field="qty_2" title="Qty" /> 
                <GridColumn field="side_remarks" title="Remarks" />
                <GridColumn field="extra" title="Extra" /> 
                <GridColumn field="qty_3" title="Qty" /> 
            </Grid>
          </ExcelExport>
  
          <ExcelExport
            data={total}
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
            <Grid data={total} style={{ height: "490px", display: "none" }}>
                <GridColumn field="supplier_name" title="Supplier" />
                <GridColumn field="main_dish" title="Total Main Dish" /> 
                <GridColumn field="side_dish" title="Total Side Dish" /> 
                <GridColumn field="extra" title="Total Extra Dish" />
                <GridColumn field="total_user_orders" title="Total of Employees Ordered" />
            </Grid>
          </ExcelExport>
        </div>
      );
    }
  }

  return (
    <div className={orderCSS.mainContainer}>
      <div className={orderCSS.mainContent}>
        <div className={orderCSS.topContent}>
          <div className={orderCSS.leftContainer}>
            <h1>{dateToday}</h1>
          </div>
          <div className={orderCSS.rightContainer}>
            <div className={orderCSS.syncButton}>
              {!isLoading &&
                <Button
                  variant="info"
                  onClick={handleSync}
                  disabled={disableSync}>
                  Sync
                </Button>}
              {isLoading &&
                <Button
                  variant="primary"
                  disabled>
                 <Spinner
                    as="span"
                    variant="light"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    animation="border"/>      
                     Syncing
                </Button>
                }
                <ToastContainer
                    position="top-center"
                    autoClose={1500}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                 />
            </div> 
            <App/>
          </div>
        </div>
        <div className={orderCSS.firstContent}>
          <div className={orderCSS.firstTable}>
            <MDBDataTable striped medium data={headers} />
          </div>
        </div>
        <div className={orderCSS.secondContent}>
          <Table striped>
            {total.map((total) => (
              <tfoot className={orderCSS.footer}>
                <tr>
                  <td>Supplier  :</td>
                  <td></td>
                  <td>{total.supplier_name}</td>
                </tr>
                <tr>
                  <td>Total Main Dish  : </td>
                  <td></td>
                  <td>{total.main_dish}</td>
                </tr>
                <tr>
                  <td>Total Side Dish   : </td>
                  <td></td>
                  <td>{total.side_dish}</td>
                </tr>
                <tr>
                  <td>Total Extra Dish : </td>
                  <td></td>
                  <td>{total.extra}</td>
                </tr>
                <tr>
                  <td>Total of Employees Ordered:</td>
                  <td></td>
                  <td>{total.total_user_orders}</td>
                </tr>
              </tfoot>
            ))}
          </Table>
        </div>
        </div>
        </div>
      );
    };
  
export default Ordersummary;
