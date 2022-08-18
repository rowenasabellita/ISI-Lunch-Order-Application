import { useState,useEffect } from "react";
import './img_holder.css'
import axios from "axios";

function TableRows({ rowsData, deleteTableRows, handleChange,handleImage,profileimg}) {
  const [sup, setSup] = useState([]);
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_ENDPOINT}/supplier`)
      .then(res => {
        setSup(res.data)
      }
      )
  }, [])

  return rowsData.map((data, index) => {
    const { id,dishName, dishType, supplier, price, image } = data;
    if(image !=="/static/media/backgroundimage.7c9d6d6ee4c74ed7b225.jpg"){
    var Url= URL.createObjectURL(image)
  }
 
    return (
      <tr key={index}>
        <td>
          <input
            type="text"
            maxLength="50"
            value={dishName}
            onChange={(evnt) => handleChange(index, evnt)}
            name="dishName"
            className="form-control"
          />
        </td>
        <td>
          <select
            name="dishType"
            value={dishType}
            type="select"
            onChange={(evnt) => handleChange(index, evnt)}
          >
            <option hidden>Choose Dish Type</option>
            <option id="1">Main Dish</option>
            <option id="2">Side Dish</option>
            <option id="3">Extra</option>
          </select>
        </td>
        <td>
          <select
            name="supplier"
            value={supplier}
            type="select"
            onChange={(evnt) => handleChange(index, evnt)}
          >
            <option hidden>Choose Supplier</option>
            {sup.map((supplier) => (
              <option value={supplier.id}>{supplier.supplier_name}</option>
            ))}
          </select>
        </td>
        <td>
          <input
            maxLength="10"
            type="text"
            value={price}
            onChange={(evnt) => handleChange(index, evnt)}
            name="price"
            className="form-control"
          />{" "}
        </td>
        <td>
        {" "}
        <div className="page">
        <div className="container">
          <div className="img-holder">
            <img src={Url} className="img"/>
          </div>
          <input type="file" accept="image/*" id="input" name="image" onChange={(evnt) => handleImage(id,evnt)}/>
        </div>
        </div>
        </td>

        <td>
          <button
            className="btn btn-danger"
            onClick={() => deleteTableRows(index)}
          >
            x
          </button>
        </td>
      </tr>
    );
  });
}
export default TableRows;
