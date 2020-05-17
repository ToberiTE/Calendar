using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Calendar_Frontend.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Login()
        {
            return View("Login");
        }
        
        public ActionResult Calendar()
        {
            return View("Calendar");
        }
    }
}