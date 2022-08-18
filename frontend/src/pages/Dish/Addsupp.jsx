import React, { useState } from "react";
import { Table, FormControl, Row } from "react-bootstrap";
import SuppRows from "./SuppRows";
import addCSS from "./Addmenu.module.css";
import suppCSS from "./Addsupp.module.css"
import axios from "axios";
import { useEffect } from "react";
import Swal from 'sweetalert2'


function timeout(delay) {
  return new Promise( res =>
    setTimeout(res, delay));
}

const Addsupp = () => {
  const handleAdd = (e) => {
    return rowsData.map((data, index) => {
      const { supplier_name, main_dish_free, side_dish_free } = data;
      axios
        .post(`${process.env.REACT_APP_API_ENDPOINT}/supplier/`, {
          supplier_name,
          main_dish_free,
          side_dish_free,
        })
        .then(async(res) => {
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: `${res.data.supplier_name}`+ " added.",
            showConfirmButton: false,
            timer: 1100
          })
          await timeout(500);
          window.location.reload(false);
        })
        .catch((err) => {
          Swal.fire({
            position: 'center',
            text: "Please fill all forms before submitting.",
            showConfirmButton: false,
            timer: 600
          })
        });
    });
  };
  const [rowsData, setRowsData] = useState([]);
  const addSuppRows = () => {
    const rowsInput = {
      supplier_name: "",
      main_dish_free: "",
      side_dish_free: "",
    };
    setRowsData([...rowsData, rowsInput]);
  };

  const deleteSuppRows = (index) => {
    const rows = [...rowsData];
    rows.splice(index, 1);
    setRowsData(rows);
  };

  const handleChange = (index, evnt) => {
    const { name, value } = evnt.target;
    const rowsInput = [...rowsData];
    rowsInput[index][name] = value;
    setRowsData(rowsInput);
  };

  const [data, setData] = useState([]);
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_ENDPOINT}/supplier/`)
      .then((res) => setData(res.data));
  }, []);

  const handleDelete = (id, e) => {
    confirmAction(id, e);
  };

  const confirmAction = async (id, e) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#76BA1B',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async(result) => {
      if (result.isConfirmed) {
        axios.delete(`${process.env.REACT_APP_API_ENDPOINT}/supplier/${id}/`);
        Swal.fire({
          position: 'center',
          title: 'Deleted.',
          text: "Supplier has been deleted.",
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        })
        await timeout(500);
        window.location.reload(false);
      }
    })
  };

  const [inEditMode, setInEditMode] = useState({
    status: false,
    rowKey: null,
  });

  const [main, setMain] = useState(null);
  /**
   * @param id
   * @param currentMain
   */
  const [side, setSide] = useState(null);
  /**
   * @param id
   * @param currentSide
   */

  const onEdit = ({ id, currentMain, currentSide }) => {
    setInEditMode({
      status: true,
      rowKey: id,
    });
    setMain(currentMain);
    setSide(currentSide);
  };
  /**
   *
   * @param id
   * @param suppName
   * @param newMain
   * @param newSide
   */
  const updateInventory = ({ id, suppName, newMain, newSide }) => {
    axios.put(`${process.env.REACT_APP_API_ENDPOINT}/supplier/${id}`, {
      supplier_name: suppName,
      main_dish_free: newMain,
      side_dish_free: newSide,
    });
  };
  /**
   *
   * @param id
   * @param suppName
   * @param newMain
   * @param newSide
   */
  const onSave = ({ id, suppName, newMain, newSide }) => {
    updateInventory({ id, suppName, newMain, newSide });
    window.location.reload(true);
  };

  const onCancel = () => {
    setInEditMode({
      status: false,
      rowKey: null,
    });
    setMain(null);
    setSide(null);
  };

  return (
    <div className={addCSS.mainContainer}>
      <div className={addCSS.container}>
        <div className={addCSS.topContent}>
          <h3>Add Supplier</h3>
        </div>
      </div>
      <div className={addCSS.firstContent}>
        <div className={addCSS.content}></div>
        <table className="table">
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Main Dish Free</th>
              <th>Side Dish Free</th>
              <th>
                <button className="btn btn-outline-dark" onClick={addSuppRows}>
                  Add Supplier
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <SuppRows
              rowsData={rowsData}
              deleteSuppRows={deleteSuppRows}
              handleChange={handleChange}
            />
          </tbody>
        </table>
        <div className={addCSS.btn1}>
          <button className="btn btn-success" onClick={handleAdd}>
            Submit
          </button>
        </div>
      </div>
      <div className={addCSS.secondContent}>
        <Table hover>
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Main Dish Free</th>
              <th>Side Dish Free</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((supp) => (
              <tr key={supp}>
                <td>{supp.supplier_name}</td>
                <td className={suppCSS.addBool}>
                  {inEditMode.status && inEditMode.rowKey === supp.id ? (
                    <div
                      className={suppCSS.mainFree}
                      onChange={(evnt) => setMain(evnt.target.value)}
                    >
                      <input type="radio" maxLength="50" value={true} />
                      true <input type="radio" maxLength="50" value={false} />
                      false
                    </div>
                  ) : (
                    `${supp.main_dish_free}`
                  )}
                </td>
                <td className={suppCSS.addBool}>
                  {inEditMode.status && inEditMode.rowKey === supp.id ? (
                    <div
                      className={suppCSS.sideFree}
                      onChange={(evnt) => setSide(evnt.target.value)}
                    >
                      <input type="radio" maxLength="50" value={true} />
                      true <input type="radio" maxLength="50" value={false} />
                      false{" "}
                    </div>
                  ) : (
                    `${supp.side_dish_free}`
                  )}
                </td>
                <td>
                  {inEditMode.status && inEditMode.rowKey === supp.id ? (
                    <React.Fragment>
                      <button
                        className={"btn btn-success"}
                        onClick={() =>
                          onSave({
                            id: supp.id,
                            suppName: supp.supplier_name,
                            newMain: main,
                            newSide: side,
                          })
                        }
                      >
                        Save
                      </button>

                      <button
                        className={"btn btn-secondary"}
                        style={{ marginLeft: 8 }}
                        onClick={() => onCancel()}
                      >
                        Cancel
                      </button>
                    </React.Fragment>
                  ) : (
                    <button
                      className={"btn btn-primary"}
                      onClick={() =>
                        onEdit({
                          id: supp.id,
                          currentMain: supp.main_dish_free,
                          currentSide: supp.side_dish_free,
                        })
                      }
                    >
                      Edit
                    </button>
                  )}
                  <button
                    className="btn btn-danger"
                    style={{ marginLeft: 8 }}
                    onClick={(e) => handleDelete(supp.id, e)}
                  >
                    x
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Addsupp;
