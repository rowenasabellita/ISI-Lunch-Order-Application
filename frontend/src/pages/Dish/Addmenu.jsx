import React, { useState } from "react";
import { Table, FormControl, Row } from "react-bootstrap";
import TableRows from "./TableRows";
import addCSS from "./Addmenu.module.css";
import axios from 'axios';
import { useEffect } from "react";
import bgimage from '../../images/backgroundimage.jpg'
import {v4 as uuidv4} from 'uuid';
import Swal from 'sweetalert2'

const Addmenu = () => {
  const date = new Date().toISOString().slice(0, 10);
  const [basicModal, setBasicModal] = useState(false);
  const toggleShow = () => setBasicModal(!basicModal);
  const [supplier, setSupplier] = useState("");
  const [profileImg,setProfileImg]=useState(bgimage) 
  const [sup, setSup] = useState([]);
  function timeout(delay) {
    return new Promise( res => setTimeout(res, delay) );
  }
  function refreshsupp(){axios.get(`${process.env.REACT_APP_API_ENDPOINT}/supplier`)
  .then(res => {
    setSup(res.data)})}
  function refreshprice(){axios.get(`${process.env.REACT_APP_API_ENDPOINT}/dish_price/`)
  .then(res => setData(res.data))}
  useEffect(() => {
    refreshprice();
    refreshsupp();
  }, [])

  const [dates, setDates] = useState([]);

  const handleAdd = (e) => {
    var imgformData= new FormData();
    e.preventDefault();
    return rowsData.map((data, index) => {
      const  { dishName, dishType, supplier, price, image, profileImg} = data;
      imgformData.append("dish_name",dishName);
      imgformData.append("dish_type",dishType);
      imgformData.append("supplier",supplier);
      imgformData.append("file",image);
      axios.post(`${process.env.REACT_APP_API_ENDPOINT}/dish/`,imgformData
      )
      .then(res => {
        axios.post(`${process.env.REACT_APP_API_ENDPOINT}/dish_price/`,{
        id:null,
        price: price,
        is_active: true,
        dish_id:res.data.id
        })
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: "Submitted",
          text: " successfully.",
          showConfirmButton: false,
          timer: 1500
        })
        refreshprice();
        timeout(500);
        window.location.reload(false);
      })
      .catch(function (error){
        Swal.fire({
          position: 'center',
          text: "Image filename is taken.",
          showConfirmButton: false,
          timer: 600
        })
      });
    })
   };

  const [rowsData, setRowsData] = useState([]);
  const addTableRows = () => {
    const rowsInput = {
      id: uuidv4(),
      dishName: "",
      dishType: "",
      supplier: "",
      price: "",
      image: profileImg,
    };
    setRowsData([...rowsData, rowsInput]);
  };

  const deleteTableRows = (index) => {
    const rows = [...rowsData];
    rows.splice(index, 1);
    setRowsData(rows);
  };

  const handleChange = (index, evnt) => {
    const { name, value} = evnt.target;
    const rowsInput = [...rowsData];
    rowsInput[index][name]  = value;
    setRowsData(rowsInput);
  };

  const handleImage=(id, evnt)=>{
    const reader = new FileReader();
    reader.onload = () =>{
      if(reader.readyState === 2){
        const index=rowsData.findIndex(c=>c.id===id)
        if(index !== -1){
          const data= rowsData[index]
          setRowsData([...rowsData.slice(0,index),{...data, image:evnt.target.files[0]},...rowsData.slice(index + 1),])
        }
      }
    }
    reader.readAsDataURL(evnt.target.files[0])
  };

  const [data, setData] = useState([]);
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_ENDPOINT}/dish_price/`)
      .then(res => setData(res.data))
  }, [])
  
  const handleDelete = (id, e) => {
    confirmAction(id, e);
  };

  const confirmAction= async(id, e) => {
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
        axios.get(`${process.env.REACT_APP_API_ENDPOINT}/dish_price/${id}/`)
        .then(res=>{
          const dishid=res.data.dish_id.id;
          axios.delete(`${process.env.REACT_APP_API_ENDPOINT}/dish/${dishid}/`)
          .then(response => {
            console.log(response.data);
            refreshprice();
          })
          .catch(error => {
            console.log(error);
          })
        })
        Swal.fire({
          position: 'center',
          title: 'Deleted.',
          text: "Dish has been deleted.",
          icon: 'success',
          showConfirmButton: false,
          timer: 1100
        })
        await timeout(500);
        window.location.reload(false);
      }
    })
  }

  const [inEditMode, setInEditMode] = useState({
      status: false,
      rowKey: null
  });
  const [unitPrice, setUnitPrice] = useState(null);
  /**
   * @param id 
   * @param currentUnitPrice 
   */
  const onEdit = ({id, currentUnitPrice}) => {
      setInEditMode({
          status: true,
          rowKey: id
      })
      setUnitPrice(currentUnitPrice);
  }
  /**
   * @param id
   * @param newUnitPrice
   */
  const updateInventory = ({id,dish_id, newUnitPrice}) => {
      fetch(`${process.env.REACT_APP_API_ENDPOINT}/dish_price/${id}`, {
          method: "PUT",
          body: JSON.stringify({
              price: newUnitPrice,
              is_active: true,
              dish_id: dish_id
          }),
          headers: {
              "Content-type": "application/json; charset=UTF-8"
          }
      })
          .then(response => response.json())
          .then(json => {
              onCancel();
          })
  }
  /**
   *
   * @param id
   * @param newUnitPrice 
   */
  const onSave = ({id,dish_id, newUnitPrice}) => {
      updateInventory({id,dish_id, newUnitPrice});
      window.location.reload(true);
  }

  const onCancel = () => {
      setInEditMode({
          status: false,
          rowKey: null
      })
      setUnitPrice(null);
  }

  return (
    <div className={addCSS.mainContainer}>
      <div className={addCSS.container}>
        <div className={addCSS.topContent}>
          <h3>Add Dish</h3>
        </div>
      </div>
      <div className={addCSS.firstContent}>
        <div className={addCSS.content}>
          <div className={addCSS.date}>
            <FormControl
              type="date"
              value={date}
              placeholder="Search"
              onChange = {(e) => setDates(e.target.value)}
              className="me-2"
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Dish Name</th>
              <th>Dish Type</th>
              <th>Supplier</th>
              <th>Price</th>
              <th>Image</th>

              <th>
                <button className="btn btn-outline-dark" onClick={addTableRows}>
                  Add Dish
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            <TableRows
              rowsData={rowsData}
              deleteTableRows={deleteTableRows}
              handleChange={handleChange}
              handleImage={handleImage}
              profileimg={profileImg}
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
              <th>Dish Name</th>
              <th>Dish Type</th>
              <th>Supplier</th>
              <th>Price</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((dish, index) => (
              <tr key={index}>
                 <td>{dish.dish_id.dish_name}</td>
                 <td>{dish.dish_id.dish_type}</td>
                 <td>{dish.dish_id.supplier.supplier_name}</td>
                 <td className={addCSS.updatePrice}>
                      {
                        inEditMode.status && inEditMode.rowKey === dish.id ? (
                            <input value={unitPrice}
                                    onChange={(event) => setUnitPrice(event.target.value)}
                            />
                        ) : (
                            `₱${dish.price}`
                        )
                    }
                </td>
                 <td>{dish.dish_id.created_at}</td>
                <td>
                {
                    inEditMode.status && inEditMode.rowKey === dish.id ? (
                        <React.Fragment>
                            <button
                                className={"btn btn-success"}
                                onClick={() => onSave({id: dish.id,dish_id: dish.dish_id.id ,newUnitPrice: unitPrice})}
                            >
                                Save
                            </button>

                            <button
                                className={"btn btn-secondary"}
                                style={{marginLeft: 8}}
                                onClick={() => onCancel()}
                            >
                                Cancel
                            </button>
                        </React.Fragment>
                    ) : (
                        <button
                            className={"btn btn-primary"}
                            onClick={() => onEdit({id: dish.id, currentUnitPrice: dish.price})}
                        >
                            Edit
                        </button>
                    )
                }
                    <button
                    className="btn btn-danger"
                    style={{marginLeft: 8}}
                    onClick={(e) => handleDelete(dish.id, e)}
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

export default Addmenu;
