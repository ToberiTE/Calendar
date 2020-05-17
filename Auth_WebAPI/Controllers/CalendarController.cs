using Auth_WebAPI.Data;
using Auth_WebAPI.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Auth_WebAPI.Controllers
{
    public class CalendarController : Controller
    {
        DayPilotDataContext db = new DayPilotDataContext();

        public class JsonEvent
        {
            public string id { get; set; }
            public string text { get; set; }
            public string start { get; set; }
            public string end { get; set; }
        }

        [Authorize]
        public ActionResult Events(DateTime? start, DateTime? end)
        {
            var events = from ev in db.events.AsEnumerable() where !(ev.end <= start || ev.start >= end) select ev;

            var result = events
            .Select(e => new JsonEvent()
            {
                start = e.start.ToString("s"),
                end = e.end.ToString("s"),
                text = e.name,
                id = e.id.ToString()
            })
            .ToList();

            return new JsonResult { Data = result, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }

        public ActionResult Create(string start, string end, string name)
        {
            var toBeCreated = new @event {
                start = Convert.ToDateTime(start),
                end = Convert.ToDateTime(end),
                name = name
            };
            db.events.InsertOnSubmit(toBeCreated);
            db.SubmitChanges();

            return new JsonResult { Data = new Dictionary<string, object> { { "id", toBeCreated.id } } };

        }

        public ActionResult Move(int id, string newStart, string newEnd)
        {
            var toBeMoved = (from ev in db.events where ev.id == id select ev).First();
            toBeMoved.start = Convert.ToDateTime(newStart);
            toBeMoved.end = Convert.ToDateTime(newEnd);
            db.SubmitChanges();

            return new JsonResult { Data = new Dictionary<string, object> { { "id", toBeMoved.id } } };
        }

        public ActionResult Resize(int id, string newStart, string newEnd)
        {
            var toBeResized = (from ev in db.events where ev.id == id select ev).First();
            toBeResized.start = Convert.ToDateTime(newStart);
            toBeResized.end = Convert.ToDateTime(newEnd);
            db.SubmitChanges();

            return new JsonResult { Data = new Dictionary<string, object> { { "id", toBeResized.id } } };
        }

        public ActionResult Delete(int id)
        {
            var toBeDeleted = (from ev in db.events where ev.id == id select ev).First();
            db.events.DeleteOnSubmit(toBeDeleted);
            db.SubmitChanges();

            return new JsonResult { Data = new Dictionary<string, object> { { "id", toBeDeleted.id } } };
        }
    }
}