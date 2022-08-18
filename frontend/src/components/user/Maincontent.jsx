import { React, useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { Nav, NavDropdown } from "react-bootstrap";
import axios from "axios";
import Cookies from "js-cookie";
import maincontentCSS from "./Maincontent.module.css";
import logo from "../../images/logo.png";
import Order from "./Order";
import { useNavigate } from "react-router-dom";
import { setAdmin } from "../auth/RequireAuth";
import { v4 as uuidv4 } from "uuid";
import Swal from 'sweetalert2'

const Maincontent = () => {
  const [cart, showCart] = useState(false);
  const [fname, setFname]=useState(Cookies.get("firstname"));
  const [lname, setLname]=useState(Cookies.get("lastname"));
  const navigate = useNavigate();
  const signOut = () => {
    localStorage.removeItem("temporary");
    localStorage.removeItem("admin");
    navigate("/");
    Cookies.remove("email");
    Cookies.remove("password");
  };

  const Admin = () => {
    axios
      .post(`${process.env.REACT_APP_API_ENDPOINT}/login/admin`, {
        email: Cookies.get("email"),
        password: Cookies.get("password"),
      })
      .then(function (response) {
        if (response.data.message) {
          setAdmin(response.data.Admin);
          navigate("/admin/dashboard");
        }
      });
  };

  const today = new Date();
  const dateToday =
    today.getFullYear() +
    "-" +
    parseInt(today.getMonth() + 1) +
    "-" +
    today.getDate();

  const [mainDish, setMainDish] = useState([]);
  const [sideDish, setSideDish] = useState([]);
  const [rice, setRice] = useState([]);
  const [headername, setHeadername] = useState("None");
  const [exist, setExist] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [total, setTotal] = useState(0);
  const [mainOrder, setMainOrder] = useState([]);
  const [sideOrder, setSideOrder] = useState([]);
  const [mainRemark, setMainRemark] = useState({
    remarks: "",
  });
  const [sideRemark, setSideRemark] = useState({
    remarks: "",
  });

  const [activeMainDish, setActiveMainDish] = useState(null);
  const [modalMainVisible, setmodalMainVisible] = useState(false);
  const [activeSideDish, setActiveSideDish] = useState(null);
  const [modalSideVisible, setModalSideVisible] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0.0);
  const ws=new WebSocket(`${process.env.REACT_APP_WS_ENDPOINT}/websocket/avail/`)
  function timeout(delay) {
    return new Promise( res => setTimeout(res, delay) );
  }
      //mainDish
     function refreshmain(){axios
      .get(
        `${process.env.REACT_APP_API_ENDPOINT}/dish_menu/${dateToday}/main_dish`
      )
      .then(
        (res) => {
        setMainDish(res.data)
        if(fname === undefined){
          signOut();
        }
        else if(fname=== "None"){
          signOut();
        }
        else{
        setHeadername(lname + ", " + fname)
        }
  })};
    //sideDish
    function refreshside(){axios
      .get(
        `${process.env.REACT_APP_API_ENDPOINT}/dish_menu/${dateToday}/side_dish`
      )
      .then((res) => setSideDish(res.data))};
    //rice
    function refreshextra(){ axios
      .get(`${process.env.REACT_APP_API_ENDPOINT}/dish_menu/${dateToday}/extra`)
      .then((res) => setRice(res.data))};

  useEffect(() => {
    refreshmain();
    refreshside();
    refreshextra();
    //getting the order_id to set if it exists
    axios
      .get(`${process.env.REACT_APP_API_ENDPOINT}/order/search/${dateToday}`)
      .then((res) => {
        setExist(res.data);
      });
  }, []);

  useEffect(() => {
    let totalMainDishPrice = mainOrder.reduce((total, c) => {
      const quantity = c.quantity || 1;
      return total + c.dish_price_id.price * quantity;
    }, 0.0);

    if (mainOrder.length !== 0) {
      const mapper = mainOrder.map(
        (c) => c.dish_price_id.dish_id.supplier.main_dish_free
      );
      if (mapper[0] === true) {
        const dish = mainOrder[0];
        totalMainDishPrice -= dish.dish_price_id.price;
      }
    }

    let totalSideDishPrice = sideOrder.reduce((total, c) => {
      const quantity = c.quantity || 1;
      return total + c.dish_price_id.price * quantity;
    }, 0.0);

    if (sideOrder.length !== 0) {
      const mapper = sideOrder.map(
        (c) => c.dish_price_id.dish_id.supplier.side_dish_free
      );
      if (mapper[0] === true) {
        const dish = sideOrder[0];
        totalSideDishPrice -= dish.dish_price_id.price;
      }
    }

    let totalRicePrice = rice.reduce((total, c) => {
      const quantity = c.quantity || 1;
      return total + c.dish_price_id.price * quantity;
    }, 0.0);
    if (rice.length) {
      const dish = rice[0];
      totalRicePrice -= dish.dish_price_id.price;
    }

    setTotalPrice(totalRicePrice + totalMainDishPrice + totalSideDishPrice);
  }, [rice, mainOrder, sideOrder]);

  //Modal for Main Dish
  const handleMainChange = (e) => {
    setMainRemark({ remarks: e.target.value });
  };

  const handleMainDish = (itemMain) => {
    setmodalMainVisible(true);
    setActiveMainDish(itemMain);
  };

  const handleMainSubmit = () => {
    const free = mainOrder.findIndex((c) => c.id === activeMainDish.id);
    const result = {
      ...activeMainDish,
      mainRemark,
      uniqueId: uuidv4(),
      free: free === -1 ? 1 : 0,
    };
    setMainOrder([...mainOrder, result]);
    setMainRemark("");
    setmodalMainVisible(false);
  };
  //Modal for Side Dish
  const handleSideChange = (e) => {
    setSideRemark({ remarks: e.target.value });
  };

  const handleSideDish = (itemSide) => {
    setModalSideVisible(true);
    setActiveSideDish(itemSide);
  };

  const handleSideSubmit = () => {
    const free = sideOrder.findIndex((c) => c.id === activeSideDish.id);
    const result = {
      ...activeSideDish,
      sideRemark,
      uniqueId: uuidv4(),
      free: free === -1 ? 1 : 0,
    };

    setSideOrder([...sideOrder, result]);
    setSideRemark("");
    setModalSideVisible(false);
  };
  // updating quantities on mainOrder
  const updateMainQuantity = (id, quantity) => {
    const index = mainOrder.findIndex((c) => c.uniqueId === id);
    if (index !== -1) {
      const order = mainOrder[index];
      setMainOrder([
        ...mainOrder.slice(0, index),
        {
          ...order,
          quantity: Number(order.quantity || 1) + quantity,
        },
        ...mainOrder.slice(index + 1),
      ]);
    }
  };

  const handleMainIncrement = (id) => {
    updateMainQuantity(id, 1);
    if (updateMainQuantity <= 1) {
      return;
    } else {
      setTotal(total + 62);
    }
    setQuantity(quantity + quantity);
  };

  const handleMainDecrement = (id) => {
    updateMainQuantity(id, -1);
    if (total === 0) {
      return;
    } else {
      setTotal(total - 62);
    }
  };
  // updating quantities on sideOrder
  const updateSideQuantity = (id, quantity) => {
    const index = sideOrder.findIndex((c) => c.uniqueId === id);
    if (index !== -1) {
      const order = sideOrder[index];
      setSideOrder([
        ...sideOrder.slice(0, index),
        {
          ...order,
          quantity: Number(order.quantity || 1) + quantity,
        },
        ...sideOrder.slice(index + 1),
      ]);
    }
  };

  const handleSideIncrement = (id) => {
    updateSideQuantity(id, 1);
    if (updateSideQuantity <= 1) {
      return;
    } else {
      setTotal(total + 15);
    }
  };

  const handleSideDecrement = (id) => {
    updateSideQuantity(id, -1);
    if (total === 0) {
      return;
    } else {
      setTotal(total - 15);
    }
  };
  // updating quantities on extraRice
  const updateRiceQuantity = (id, quantity) => {
    const index = rice.findIndex((c) => c.id === id);
    if (index !== -1) {
      const order = rice[index];
      setRice([
        ...rice.slice(0, index),
        {
          ...order,
          quantity: Number(order.quantity || 1) + quantity,
        },
        ...rice.slice(index + 1),
      ]);
    }
  };

  const handleRiceIncrement = (id) => {
    updateRiceQuantity(id, 1);
    if (updateRiceQuantity <= 1) {
      return;
    } else {
      setTotal(total + 10);
    }
  };

  const handleRiceDecrement = (id) => {
    updateRiceQuantity(id, -1);
    if (total === 0) {
      return;
    } else {
      setTotal(total - 10);
    }
  };

  // Post Final Order
  const HandleOrder = async () => {
    const extraRice = rice.filter(
      (c) => c.dish_price_id.dish_id.dish_type === "Extra"
    );
    const mustOrder = [...mainOrder, ...sideOrder];
    const newOrder = [...mainOrder, ...sideOrder, ...extraRice];
    const orderData = [newOrder, dateToday];

    Swal.fire({
      title: 'Continue?',
      text: "Please finalize your order.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#76BA1B',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Confirm'
    }).then(async(result) => {
      if (result.isConfirmed) {
        if (mustOrder.length === 0) {
          Swal.fire({
            position: 'center',
            icon: 'warning',
            text: "Please select main/side dish.",
            showConfirmButton: false,
            timer: 1000
          })
        } else if (mustOrder.length >= 1) {
          const mapper = orderData[0].map(
            ({
              id,
              dish_availability,
              dish_price_id,
              menu_id,
              mainRemark,
              quantity,
              sideRemark,
            }) => ({
              id: id,
              dish_availability: dish_availability,
              dish_price_id: dish_price_id,
              menu_id: menu_id,
              remarks: mainRemark || sideRemark || "",
              quantity: quantity,
            })
          );
  
          const items = mapper.map(
            ({ id, quantity, remarks, dish_price_id }) => ({
              dish_menu_id: id,
              quantity: quantity || 1,
              remarks: remarks.remarks || "",
              order_price: dish_price_id.price,
            })
          );
          const quantityerror = mapper.map(({ dish_availability }) => ({
            dish_availability
          }))
          var results = []
          for (var i = 0; i < quantityerror.length; i++) {
            results.push(quantityerror[i].dish_availability)
          }
          var minresults = Math.min(...results)
          if (minresults !== 0) {
            const { data: finalOrderData } = await axios.post(
              `${process.env.REACT_APP_API_ENDPOINT}/order/`,
              {
                order_date: dateToday,
                user_id: Cookies.get("userid"),
              }
            ).catch(function (error) {
              if (error.message === "Request failed with status code 400") {
                Swal.fire({
                  position: 'center',
                  icon: 'warning',
                  text: "You can only order once per day.",
                  showConfirmButton: false,
                  timer: 1000
                })
              }
            })
  
            const data = await axios.post(
              `${process.env.REACT_APP_API_ENDPOINT}/ordered_dish/`,
              {
                order_id: finalOrderData.id,
                items,
              }
            );
            Swal.fire({
              position: 'center',
              title: 'Ordered',
              text: "Submitted successfully.",
              icon: 'success',
              showConfirmButton: false,
              timer: 1500
            })
            await timeout(500);
            window.location.reload(false);
            
            const id_avail = mapper.map((c) => (c.id));
            const quantity = items.map((c) => (c.quantity));
            ws.send([id_avail]);
            ws.send([quantity]);
            timeout(2000);
            refreshmain();
            refreshside();
            refreshextra();
            window.location.reload(false)
        
          } else {
            Swal.fire({
              position: 'center',
              title: 'Sold Out',
              icon: 'warning',
              text: "One of the dish is sold out please pick again.",
              showConfirmButton: false,
              timer: 1500
            })
            await timeout(500);
            window.location.reload(false);
          }
        }
      }
    })
  };

  const deleteTableMainRow = (rowMainId) => {
    const rowMain = [...mainOrder];
    const index = mainOrder.findIndex((c) => c.id === rowMainId);
    rowMain.splice(index, 1);
    setMainOrder(rowMain);
  };

  const deleteTableSideRow = (rowSideId) => {
    const rowSide = [...sideOrder];
    const index = sideOrder.findIndex((c) => c.id === rowSideId);
    rowSide.splice(index, 1);
    setSideOrder(rowSide);
  };

  return (
    <div className={maincontentCSS.mainContent}>
      <Order
        show={cart}
        mainOrder={mainOrder}
        sideOrder={sideOrder}
        deleteTableMainRow={deleteTableMainRow}
        deleteTableSideRow={deleteTableSideRow}
        mainRemark={mainRemark}
        handleMainDecrement={handleMainDecrement}
        handleMainIncrement={handleMainIncrement}
        handleSideDecrement={handleSideDecrement}
        handleSideIncrement={handleSideIncrement}
        rice={rice}
        handleRiceDecrement={handleRiceDecrement}
        handleRiceIncrement={handleRiceIncrement}
        total={totalPrice}
        HandleOrder={HandleOrder}
      />
      <div className={maincontentCSS.topBarContainer}>
        <div className={maincontentCSS.leftBar}>
          <img src={logo} alt="img" className={maincontentCSS.logo} />
          <h5>INNOVUZE SOLUTIONS INC. </h5>
          <h5 id={maincontentCSS.title}>LUNCH BUDDIES</h5>
        </div>
        <div className={maincontentCSS.rightBar}>
          <label>{headername}</label>
          <Nav className={maincontentCSS.nav}>
            <NavDropdown id="nav-dropdown-dark-example" title="" color="white">
              <NavDropdown.Item href="#action/3.1">
                {headername}
              </NavDropdown.Item>
              {Cookies.get("role") === "Admin" ? (
                <NavDropdown.Item href="#action/3.2" onClick={Admin}>
                  Admin
                </NavDropdown.Item>
              ) : null}
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4" onClick={signOut}>
                Log Out
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <i className="bx bx-cart" onClick={() => showCart(!cart)} />
        </div>
      </div>
      <div className={maincontentCSS.headerContent}>
        <div className={maincontentCSS.headerData}>
          <span>MENU FOR TODAY!!</span>
        </div>
      </div>
      <div className={maincontentCSS.Content}>
        <div className={maincontentCSS.topContent}>
          <span>Main Dish</span>
          <input
            type="date"
            value={dateToday}
            className={maincontentCSS.menuDate}
          />
        </div>
        <div className={maincontentCSS.wrapperContent}>
          <ul className={maincontentCSS.dish_list}>
            <Modal
              show={modalMainVisible}
              dialogClassName={maincontentCSS.modalDialog}
            >
              <div className={maincontentCSS.modalHeader}>
                {activeMainDish ? (
                  <img
                    src={activeMainDish.dish_price_id.dish_id.img_url}
                    className={maincontentCSS.modalHeader}
                  />
                ) : null}
              </div>
              <Modal.Header>
                <div className={maincontentCSS.leftheader}>
                  {activeMainDish ? (
                    <h3>{activeMainDish.dish_price_id.dish_id.dish_name}</h3>
                  ) : null}
                </div>
              </Modal.Header>
              <Modal.Body>
                <div className={maincontentCSS.modalContainer}>
                  <br />
                  <div>
                    <h5>Special Instructions</h5>
                    <p>Any specific preferences? Let the supplier know.</p>
                    {activeMainDish ? (
                      <Form.Control
                        as="textarea"
                        placeholder="Enter comment..."
                        rows={3}
                        value={mainRemark.remarks}
                        onChange={handleMainChange}
                      />
                    ) : null}
                  </div>
                  <br />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setmodalMainVisible(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={handleMainSubmit}
                  disabled={mainOrder.some((c) => c.id === activeMainDish.id)}
                >
                  Confirm
                </Button>
              </Modal.Footer>
            </Modal>
            {mainDish.map((itemMain, index) => (
              <li key={index}>
                <button
                  onClick={() => handleMainDish(itemMain)}
                  type="submit"
                  className={maincontentCSS.btn}
                >
                  <div className={maincontentCSS.dish_container}>
                    <picture>
                      <div className={maincontentCSS.dish_picture}>
                        <img
                          className={maincontentCSS.img_index}
                          src={itemMain.dish_price_id.dish_id.img_url}
                        />
                      </div>
                    </picture>
                    <div className={maincontentCSS.dish_btn}>
                      <div className={maincontentCSS.dish_text}>+</div>
                    </div>
                    <figcaption className={maincontentCSS.dish_info}>
                      <span className={maincontentCSS.dish_avail}>
                        Availability: {itemMain.dish_availability}
                      </span>
                      <span className={maincontentCSS.dish_name}>
                        {itemMain.dish_price_id.dish_id.dish_name}
                      </span>
                    </figcaption>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className={maincontentCSS.Content}>
        <div className={maincontentCSS.topContent}>
          <span>Side Dish</span>
        </div>
        <div className={maincontentCSS.wrapperContent}>
          <ul className={maincontentCSS.dish_list}>
            <Modal
              show={modalSideVisible}
              dialogClassName={maincontentCSS.modalDialog}
            >
              <div className={maincontentCSS.modalHeader}>
                {activeSideDish ? (
                  <img
                    src={activeSideDish.dish_price_id.dish_id.img_url}
                    className={maincontentCSS.modalHeader}
                  />
                ) : null}
              </div>
              <Modal.Header>
                <div className={maincontentCSS.header}>
                  <div className={maincontentCSS.leftheader}>
                    {activeSideDish ? (
                      <h3>{activeSideDish.dish_price_id.dish_id.dish_name}</h3>
                    ) : null}
                  </div>
                </div>
              </Modal.Header>
              <Modal.Body>
                <br />
                <div>
                  <h5>Special Instructions</h5>
                  <p>Any specific preferences? Let the supplier know.</p>
                  <Form.Control
                    as="textarea"
                    placeholder="Enter comment..."
                    rows={3}
                    value={sideRemark.remarks}
                    onChange={handleSideChange}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setModalSideVisible(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSideSubmit}
                  disabled={sideOrder.some((c) => c.id === activeSideDish.id)}
                >
                  Confirm
                </Button>
              </Modal.Footer>
            </Modal>
            {sideDish.map((itemSide, index) => (
              <li key={index}>
                <button
                  onClick={() => handleSideDish(itemSide)}
                  type="submit"
                  className={maincontentCSS.btn}
                >
                  <div className={maincontentCSS.dish_container}>
                    <picture>
                      <div className={maincontentCSS.dish_picture}>
                        <img
                          className={maincontentCSS.img_index}
                          src={itemSide.dish_price_id.dish_id.img_url}
                        />
                      </div>
                    </picture>
                    <div className={maincontentCSS.dish_btn}>
                      <div className={maincontentCSS.dish_text}>+</div>
                    </div>
                    <figcaption className={maincontentCSS.dish_info}>
                      <span className={maincontentCSS.dish_avail}>
                        Availability: {itemSide.dish_availability}
                      </span>
                      <span className={maincontentCSS.dish_name}>
                        {itemSide.dish_price_id.dish_id.dish_name}
                      </span>
                    </figcaption>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Maincontent;
