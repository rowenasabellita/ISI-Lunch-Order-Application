import React, { useState } from "react";
import { MDBTable, MDBTableHead, MDBTableBody } from "mdb-react-ui-kit";
import { Button } from "react-bootstrap";

import "./Order.css";
import { MDBTableFoot } from "mdbreact";

const Order = ({
  show,
  mainOrder,
  sideOrder,
  deleteTableMainRow,
  deleteTableSideRow,
  handleMainIncrement,
  handleMainDecrement,
  handleSideIncrement,
  handleSideDecrement,
  rice,
  handleRiceIncrement,
  handleRiceDecrement,
  total,
  HandleOrder,
}) => {
  return (
    <div className={show ? "modalContainer active" : "modalContainer "}>
      <div className="modaltopContent">
        <span>Your Cart</span>
      </div>
      <div className="modalContent">
          <hr />
          <MDBTable>
            <MDBTableHead>
              <tr>
                <th rowSpan="2" scope="col">
                  Order
                </th>
                <th rowSpan="2" scope="col">
                  Quantity
                </th>
                <th rowSpan="2" scope="col">
                  Price
                </th>
                <th rowSpan="2" scope="col" colSpan="3">
                  Remarks
                </th>
                <th rowSpan="2" scope="col"></th>
              </tr>
            </MDBTableHead>
            <MDBTableBody className="tableBody">
              {mainOrder.map((mainOrders, index) => (
                <tr key={index}>
                  <td>{mainOrders.dish_price_id.dish_id.dish_name}</td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleMainDecrement(mainOrders.uniqueId)}
                      disabled={mainOrders.quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="span">{mainOrders.quantity || 1}</span>

                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleMainIncrement(mainOrders.uniqueId)}
                      disabled={mainOrders.quantity === mainOrders.dish_availability}
                    >
                      +
                    </Button>
                  </td>
                  <td>₱{mainOrders.dish_price_id.price}</td>
                  <td colSpan="3" className="remarks">
                    <span>{mainOrders.mainRemark.remarks}</span>
                  </td>
                  <td>
                    <span
                      className="spanButton"
                      onClick={() => deleteTableMainRow(mainOrders.id)}
                    >
                      <i className="bx bx-trash" />
                    </span>
                  </td>
                </tr>
              ))}
            </MDBTableBody>
            <MDBTableBody className="tableBody">
              {sideOrder.map((sideOrders, index) => (
                <tr key={index}>
                  <td>{sideOrders.dish_price_id.dish_id.dish_name}</td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleSideDecrement(sideOrders.uniqueId)}
                      disabled={sideOrders.quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="span">{sideOrders.quantity || 1}</span>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleSideIncrement(sideOrders.uniqueId)}
                      disabled={sideOrders.quantity === sideOrders.dish_availability}
                    >
                      +
                    </Button>
                  </td>
                  <td>₱{sideOrders.dish_price_id.price}</td>
                  <td colSpan="3" className="remarks">
                    <span>{sideOrders.sideRemark.remarks}</span>
                  </td>
                  <td>
                    <span
                      className="spanButton"
                      onClick={() => deleteTableSideRow(sideOrders.id)}
                    >
                      <i className="bx bx-trash" />
                    </span>
                  </td>
                </tr>
              ))}
            </MDBTableBody>
            <MDBTableFoot>
              {rice.map((extraRice, index) => {
                if (extraRice.dish_price_id.dish_id.dish_type === "Extra") {
                  return (
                    <tr className="table-primary" key={index}>
                      <td>{extraRice.dish_price_id.dish_id.dish_name}</td>
                      <td>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleRiceDecrement(extraRice.id)}
                          disabled={extraRice.quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="span">{extraRice.quantity || 1}</span>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleRiceIncrement(extraRice.id)}
                          disabled={extraRice.quantity === extraRice.dish_availability}
                        >
                          +
                        </Button>
                      </td>
                      <td>₱{extraRice.dish_price_id.price}</td>
                      <td colSpan="4"></td>
                    </tr>
                  );
                } else {
                  return false;
                }
              })}
            </MDBTableFoot>
          </MDBTable>
      </div>
      <div className="modalFooter">
        <div className="leftFooter">
          <h5>Total: ₱{total}</h5>
        </div>
        <div className="rightFooter">
          <Button type="submit" className="btn" onClick={HandleOrder}>
            Confirm
          </Button>
          <span id="ws-id"></span>
        </div>
      </div>
    </div> 
  );
};

export default Order;
