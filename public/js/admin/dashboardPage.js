$(document).ready(() => {
    $.get("/dashboard/home", results => {
       outputdashboard(results, $(".home-content"));
    })
  })
  
  function outputdashboard(results, container) {
    container.html("");
  
    if (results.length == 0) {
        container.append("<span class='noResults'>Nothing to show.</span>")
    }
    else {
        container.append(`
        <div class="overview-boxes">
          <div class="box">
            <div class="right-side">
              <div class="box-topic">Total User</div>
              <div class="number">${results.total_users}</div>
              <div class="indicator">
                <i class='bx bx-up-arrow-alt'></i>
                <span class="text">Up from yesterday</span>
              </div>
            </div>
           <i class='bx bxs-face-mask cart'></i>
          </div>
          <div class="box">
            <div class="right-side">
              <div class="box-topic">Total Post</div>
              <div class="number">${results.total_posts}</div>
              <div class="indicator">
                <i class='bx bx-up-arrow-alt'></i>
                <span class="text">Up from yesterday</span>
              </div>
            </div>
            <i class='bx bxs-report cart two'></i>
          </div>
          <div class="box">
            <div class="right-side">
              <div class="box-topic">Total Like</div>
              <div class="number">${results.total_likes}</div>
              <div class="indicator">
                <i class='bx bx-up-arrow-alt'></i>
                <span class="text">Up from yesterday</span>
              </div>
            </div>
            <i class='bx bx-like cart three' ></i>
          </div>
          <div class="box">
            <div class="right-side">
              <div class="box-topic">Total Report</div>
              <div class="number">${results.total_Disliked}</div>
              <div class="indicator">
                <i class='bx bx-down-arrow-alt down'></i>
                <span class="text">Down From Today</span>
              </div>
            </div>
            <i class='bx bx-dislike cart four' ></i>
          </div>
          </br>
          </br>
          </br>
          </br>
          </br>
          </br>
          </br>
          <div class="box">
          <div class="right-side">
            <div class="box-topic">Total Reasked</div>
            <div class="number">${results.total_Reasked}</div>
            <div class="indicator">
              <i class='bx bx-down-arrow-alt down'></i>
              <span class="text">Down From Today</span>
            </div>
          </div>
          <i class='bx bx-repost cart four' ></i>
        </div>
        </div> `);
    }
  }
