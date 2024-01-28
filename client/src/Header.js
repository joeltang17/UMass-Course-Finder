import React from "react";
import rmpImage from "./rmpID.jpg"; 

function Header () {
    return (
        <div>
            <h1>⚠️Under Construction⚠️</h1>
            <p>Hello! The website works but the styling/UI has hardly been worked on.</p>
            <p>To use the scraper, input the id of a professor in the<span>&nbsp;</span>
                <div className="container">
                    <u className="text">rate my professor URL</u>
                    <img className="picture" src={rmpImage} alt="Your Image" />
                </div> 
                <span>&nbsp;</span>and, optionally, a class number to scrape the data for that class.
            </p>
        </div>
    )     
}

export default Header;
