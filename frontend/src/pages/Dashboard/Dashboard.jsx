import React, { useState } from "react";
import { Table } from "react-bootstrap";
import dashCSS from "./Dashboard.module.css";
import axios from "axios";
import { useEffect } from "react";
import Swal from 'sweetalert2'
import editIcon from "../../images/icon-edit.png";

const groupedColumns = [
  {
    id: "1",
    headerOne: "Dish Name",
    headerTwo: "Dish Type",
    headerThree: "Availability",
  },
];

const Dashboard = () => {
  const today = new Date();
  const dateToday =
    today.getFullYear() +
    "-" +
    ("0" + parseInt(today.getMonth() + 1)).slice(-2) +
    "-" + 
    ("0" + today.getDate()).slice(-2);
  
  const [data, setData] = useState([]);
  const [supplier, setSupplier] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [deselectedItems, setDeselectedItems] = useState([]);
  const [menu, setMenu] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [date, setDate] = useState(dateToday);
  const [isDisabled, setDisabled] = useState(true);
  const [addDisabled, setAddDisabled] = useState(false);
  const [menusToday, setMenusToday] = useState([]);
  const [errorMessage, setErrorMessage] = useState();
  const [availabilityDisabled, setAvailabilityDisabled] = useState(true);
  const [editDisabled, setEditDisabled] = useState(false);
  const [inEditMode, setInEditMode] = useState({
    status: true,
    rowKey: null,
  });

  function timeout(delay) {
    return new Promise( res =>
      setTimeout(res, delay));
  }

  useEffect(async (e) => {
    if (supplier) { 
      const { data: sup } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/dish_menu/set/supplier/${supplier}/${date}`)
      if (sup) { 
        setDishes(sup)
      }
    }
  }, [supplier])

  useEffect(async () => {
    const { data } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/supplier`)
    if (data) {
      setData(data)
      setSupplier(data[0].id);
    }

    const { data: getDishMenuSetPerDate } = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/dish_menu/dish_price_id/${dateToday}`)
    if (getDishMenuSetPerDate) {
      setMenusToday(getDishMenuSetPerDate)
      if(getDishMenuSetPerDate != 0){
        setDisabled(false)
        setAvailabilityDisabled(true)

      }

      const currentMenu = getDishMenuSetPerDate.map(c => {
        return {
          availability: c.dish_availability,
          ...c.dish_price_id
        }
      })
      setMenu(currentMenu)
    }
    
  }, [])

  const onSelectItem = async(e) => {
    if (e.target.checked) {
      setSelectedItems([...selectedItems, e.target.value]);
      const supplierItems = menu.map(async(m) => {
        if(supplier !== m.dish_id.supplier.id){
          const items = dishes
          .filter((c) => selectedItems.indexOf(c.id) !== -1)
          .map((c) => ({ ...c, availability: 1 }));
          setAddDisabled(true)
          setErrorMessage("Cant add dish with the selected Supplier.");
          await timeout(3000);
          setErrorMessage("")
          window.location.reload(false)
       
        }else{
          setAddDisabled(false)
          setErrorMessage(null)
        }
      });
      
    } else {
      const index = selectedItems.findIndex((c) => c === e.target.value);
      if (index !== -1) {
        setSelectedItems([
          ...selectedItems.slice(0, index),
          ...selectedItems.slice(index + 1),
        ]);
      }
    }
  };

  const onDeselectItem = (e) => {
    if (e.target.checked) {
      setDeselectedItems([...deselectedItems, e.target.value]);
    } else {
      const index = deselectedItems.findIndex((c) => c === e.target.value);
      if (index !== -1) {
        // Remove from deselectedItems
        setDeselectedItems([
          ...deselectedItems.slice(0, index),
          ...deselectedItems.slice(index + 1),
        ]);
      }
    }
  };

  const handleAddItems = () => {
    const items = dishes
    .filter((c) => selectedItems.indexOf(c.id) !== -1)
    .map((c) => ({ ...c, availability: 1 }));
    setEditDisabled(true)
    setAddDisabled(false)
    setAvailabilityDisabled(false)
    setMenu([...menu, ...items]);
    if (menu.length < 1) {
      setDisabled(false)
      setAvailabilityDisabled(false)

    }
    const newDishes = dishes.filter((c) => selectedItems.indexOf(c.id) === -1);
    setDishes(newDishes);
    
    // Remove IDs from menu from the selectedItems
    const newSelectedItems = selectedItems.filter((c) =>
    newDishes.find((d) => d.id === c)
    );
    setSelectedItems(newSelectedItems);

  };

  const handleRemoveItems = async() => {
    const items = menu.filter((c) => deselectedItems.indexOf(c.id) !== -1);
    setDishes([...dishes, ...items]);

    const newMenu = menu.filter((c) => deselectedItems.indexOf(c.id) === -1);
    setMenu(newMenu);

    // Remove IDs from menu from the selectedItems
    const newDeselectedItems = deselectedItems.filter(
      (c) => items.findIndex((d) => d.id === c) === -1
    );

    setDeselectedItems(newDeselectedItems);
  };

  const handleOnAvailabilityChange = (id, e) => {
    let value = e.target.value;
    // Apply min/max
    if (value !== "") {
      if (Number(value) < Number(e.target.min)) {
        value = e.target.min;
      } else if (Number(value) > Number(e.target.max)) {
        value = e.target.max;
      }
    }
    const index = menu.findIndex((c) => c.id === id);
    setMenu([
      ...menu.slice(0, index),
      {
        ...menu[index],
        availability: value,
      },
      ...menu.slice(index + 1),
    ]);
  };

  const handleAvailabilityBlur = (id, value) => {
    if (value === "") {
      value = 1;
    }
    const index = menu.findIndex((c) => c.id === id);
    setMenu([
      ...menu.slice(0, index),
      {
        ...menu[index],
        availability: value,
      },
      ...menu.slice(index + 1),
    ]);
  };

  const handleEdit = (id, e) => {
    e.preventDefault();
    setAvailabilityDisabled(false)
    setInEditMode({
      status: false,
      rowKey: id
    });
  }
  
  const handleUpdate = async (id, e) => {
    e.preventDefault();
    let value = e.target.value;
    const {data: getDishMenuID} = await axios.get(`${process.env.REACT_APP_API_ENDPOINT}/dish_menu/${id}/${date}/search/`)

    const updateAvailability = await axios.put(`${process.env.REACT_APP_API_ENDPOINT}/dish_menu/${getDishMenuID.id}/update/`, {
      dish_availability: value
    })
    await timeout(100);
    window.location.reload(false);
    setAvailabilityDisabled(true)
  }

  const onCancel = () => {
    setInEditMode({
      status: false,
      rowKey: null,
    });
    setAvailabilityDisabled(true)
  }

  const confirmAction = async () => {
    Swal.fire({
      title: 'Are you sure to submit at',
      text: `${date}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#76BA1B',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirm'
    }).then(async(result) => {
      const { deleteMenus } = await axios.delete(`${process.env.REACT_APP_API_ENDPOINT}/menu/${date}/`)
      const { data: menuDate } = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/menu/`, {
        date: date,
      })

      const items = menu.map(({ id, availability }) => ({
        dish_availability: Number(availability),
        dish_price_id: id
      }));

      const dishMenu = await axios.post(`${process.env.REACT_APP_API_ENDPOINT}/dish_menu/`, {
        items,
        menu_id: menuDate.id
      });
      if (result.isConfirmed) {
        Swal.fire({
          position: 'center',
          title: 'Submitted',
          text: "successfully.",
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        })
        await timeout(500);
        window.location.reload(false);
      }
    })
  }

  const handlePost = async (e) => {
    e.preventDefault();
    
    if (menu.length !== 0) {
      confirmAction();
    
    }
  };

  const handleClear = async (e) => {
    e.preventDefault();
    
    Swal.fire({
      title: 'Clear all selection?',
      text: "You won't be able to revert this.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#76BA1B',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirm'
    }).then(async(result) => {
      if (result.isConfirmed) {
        const { deleteMenus } = await axios.delete(`${process.env.REACT_APP_API_ENDPOINT}/menu/${dateToday}/`)
        await timeout(500);
        window.location.reload(false);
      }
    })
  }

  return (
    <div className={dashCSS.mainContainer}>
      <div className={dashCSS.container}>
        <div className={dashCSS.topContent}>
          <h3>Dashboard</h3>
        </div>
        <div className={dashCSS.mainContent}>
          <div className={dashCSS.content}>
            {/* first content */}
            <div className={dashCSS.firstContent}>
              <div className={dashCSS.Table}>
                <div className={dashCSS.top}>
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
                <div className={dashCSS.errorMessage}><span>{errorMessage}</span></div>

                <Table className={dashCSS.tableBody}>
                  <thead>
                    {groupedColumns.map((column) => (
                      <tr key={column.id}>
                        <th>{column.headerOne}</th>
                        <th>{column.headerTwo}</th>
                      </tr>
                    ))}
                  </thead>
                  <tbody className={dashCSS.tbody}>
                    {dishes.map((data) => (
                      <tr key={data.id}>
                        <td className={dashCSS.leftInput}>
                          <input
                            type="checkbox"
                            value={data.id}
                            onChange={onSelectItem}
                          />
                          {data.dish_id.dish_name}
                        </td>
                        <td>{data.dish_id.dish_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
            {/* second content */}
            <div className={dashCSS.secondContent}>
              <button disabled={addDisabled} className="btn btn-dark" onClick={handleAddItems}>
                {">>"}
              </button>
              <br />
              <button className="btn btn-dark" onClick={handleRemoveItems}>
                {"<<"}
              </button>
            </div>
            {/* third content */}
            <div className={dashCSS.thirdContent}>
              <div className={dashCSS.Table}>
                <form>
                  <div className={dashCSS.top}>
                    <div className={dashCSS.menuDate}>
                      <input
                        required
                        type="date"
                        className="form-control"
                        value={date}
                        name="date"
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    <div className={dashCSS.buttonGroup}>
                        <button
                          className={dashCSS.clearButton}
                          type="submit"
                          onClick={handleClear}
                          >
                          Clear</button>
                      <div className={dashCSS.menuSubmit}>
                        <button
                          type="submit"
                          className="btn btn-success"
                          onClick={handlePost}
                          disabled={isDisabled}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                  </div>
                  {menu.length < 1 && menusToday.length ? (
                    <div className={dashCSS.notification}>
                      You have unsaved changes? Click Clear if you want to remove all menu item entries for the current date.
                    </div>
                  ) : null}
                  <br />
                  <Table className={dashCSS.tableBody}>
                    <thead>
                      {groupedColumns.map((column) => (
                        <tr key={column.id}>
                          <th>{column.headerOne}</th>
                          <th>{column.headerThree}</th>
                          <th>Action</th>
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {menu.map((data, index) => (
                        <tr key={data.id}>
                          <td className={dashCSS.rightInput}>
                            {" "}
                            <input
                              type="checkbox"
                              value={data.id}
                              onChange={onDeselectItem}
                            />
                            {data.dish_id.dish_name}
                          </td>
                          <td className={dashCSS.availability}>
                            <input
                              className="form-control"
                              type="number"
                              min="1"
                              max="100"
                              value={data.availability}
                              onBlur={(e) =>
                                handleAvailabilityBlur(data.id, e.target.value)
                              }
                              onChange={(e) =>
                                handleOnAvailabilityChange(data.id, e)
                              }
                              disabled={availabilityDisabled}
                            />
                          </td>
            
                          <td>
                          {
                            inEditMode.status == false && inEditMode.rowKey == data.id ? (
                              <div>
                                <button
                                  className={dashCSS.doneButton}
                                  type="submit"
                                  value={data.availability}
                                  onClick={((e) => {
                                    handleUpdate(data.id, e);
                                  })}
                                >               
                                Save
                                </button>
                                <button 
                                  className={dashCSS.closeButton}
                                  onClick={() => {onCancel()}}
                                >
                                X
                                </button>
                              </div>
                              
                            ) : (
                              <button 
                                className={dashCSS.updateButton}
                                disabled={editDisabled}
                                onClick={((e)=> {
                                  handleEdit(data.id, e);
                                })}
                              >
                              <img src={editIcon} alt="Edit"/>
                              </button>
                            )
                          }
                          </td> 
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
