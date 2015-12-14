
//event listeners
$(document).on("click", ".popcorn", function(e){
	e.preventDefault();
	var searchterm = $(".searchfield").val();
	getFilms(searchterm);
});

$(document).on("click", ".btn", function(e){
	e.preventDefault();
	var $imdb = $(this).closest(".descr").find(".title").data("imdb");
	getPick($imdb);
});

//function defs
function getFilms(searchterm){
	$("#results").html("");
	//replace spaces w/ '+' via regexp
	searchterm = searchterm.replace(/ /g, "+");
	var jsonurl = "http://www.omdbapi.com/?s="+ searchterm +"&y=&plot=full&r=json";
	$.getJSON(jsonurl, function(result){
		if(result.Response==="False"){
			$("#results").html("<p><span class=\"lead\">Sorry, no film titles found!</span></p><p>Possible causes:<ul><li>Misspelling in title</li><li>Film too obscure</li></ul></p>");
		}else{
			console.log("It worked! Searchterm is " +searchterm);
			var resultsArray = result.Search;
			$.each(resultsArray, function(indx,obj){
				//display results below search box (no games)
				if (obj.Type !== "game"){
					printFilms(obj);
				}
			});
		}

	});
}

//function defs

function printFilms(obj){
	if(obj.Poster==="N/A"){
		var poster = "notavail.jpg";
	}else{
		var poster = obj.Poster;
	}
	if(obj.Title.length>50){
		var title = obj.Title.slice(0,45)+"...";
	}else{
		var title = obj.Title;
	}
	var $moviebox = $("<div class=\"moviebox\"><div class=\"poster\"><img src=\""+poster+"\" align=\"left\"/></div><div class=\"descr\"><p><span class=\"title\" data-imdb=\""+obj.imdbID+"\">"+title+"</span><span class=\"year\"><br>("+obj.Year+")</span></p><button class=\"btn\">Check Ratings</button></div></div>");
	$("#results").append($moviebox).slideDown();
}

function getPick($imdb){
	console.log($imdb);
	var jsonurl = "http://www.omdbapi.com/?i="+ $imdb +"&tomatoes=true&plot=full&r=json";
	$.getJSON(jsonurl, function(result){
		buildPick(result);
	});
}

function buildPick(result){
	var movie = result;
	//score vars
	
	//result deets
	if(movie.Poster==="N/A"){
		var poster = "notavail.jpg";
	}else{
		var poster = movie.Poster;
	}
	var title = movie.Title;
	var year = movie.Year;
	//structure
	var $moviebox = $("<div class=\"moviebox\"><div class=\"poster\"><img src=\""+poster+"\" align=\"left\"/></div><div class=\"descr\"><p><span class=\"title\">"+title+"</span><span class=\"year\"><br>("+year+")</span></p></div></div>");
	
	/*
	<div class=\"moviebox\">
		<div class=\"poster\">
			<img src=\""+poster+"\" align=\"left\"/>
		</div>
		<div class=\"descr\">
			<p><span class=\"title\" data-imdb=\""+obj.imdbID+"\">"
			   +title+"</span><span class=\"year\"><br>("
			   +obj.Year+")</span>
			</p>
		</div>
	</div>

	*/
	var $ratings = calcRatings(movie);

	$("#results").html("");
	$("#results").append($moviebox);
	$(".moviebox").find(".descr").append($ratings);

	$(".moviebox").append($("<div id=\"moreinfo\"><p><b>Runtime:</b> "+ movie.Runtime +"</p><p><b>Genre:</b>: "+ movie.Genre +"</p><p><b>Actors:</b> "+ movie.Actors +"</p><p class=summary><b>Summary:</b> "+ movie.Plot +"</p></div>"));
	/*
	<div id="moreinfo">
		<p>Runtime: "+ movie.Runtime +"</p>
		<p>Genre: "+ movie.Genre +"</p>
		<p>Actors: "+ movie.Actors +"</p>
		<p class=summary>Summary: "+ movie.Plot +"</p>
	</div>
	*/
}

function calcRatings(movie){
	var overall;
	var imdb = isNaN((+movie.imdbRating)*10) ? "N/A" : +(movie.imdbRating)*10;
	var tomato = isNaN(+movie.tomatoMeter) ? "N/A" : +movie.tomatoMeter;
	var tomatoUser = isNaN(+movie.tomatoUserMeter) ? "N/A" : +movie.tomatoUserMeter;
	var tomatoes = isNaN((tomato + tomatoUser)/2) ? "N/A" : (tomato + tomatoUser)/2;
	var meta = isNaN(+movie.Metascore) ? "N/A" : +movie.Metascore;

	var ratingOverall = function(){
		var ratingsArray = [tomatoes, imdb, meta];
		var sum = 0;

		for(var i=0; i<ratingsArray.length; i++){
			if(ratingsArray[i]==="N/A"){
				ratingsArray.splice(i,1);
				//reduce index for next loop bc splice reduced following index number
				i--;
			}else{
				sum += ratingsArray[i];
			}
		}
		console.log(ratingsArray);

		return sum/ratingsArray.length;
	};
	var ratingoverall = ratingOverall().toFixed(2);

	if(ratingoverall<50){
		var colorClass = "red";
	}else{
		var colorClass = "green";
	};

	return $("<div id=\"ratings\"><p><span id=\"overall\">Rating: <span id=\"overallnum\" class=\""+ colorClass +"\">"+ ratingoverall +"%</span></span></p><p><span class=\"sub tomatoes\">Rotten Tomatoes Total: "+ tomatoes +"%</span></p><p><span class=\"sub tomato\">RT critics: "+ tomato +"%</span></p><p><span class=\"sub tomatouser\">RT Users: "+ tomatoUser +"%</span></p><p><span class=\"sub imdb\">IMDb: "+ imdb +"%</span></p><p><span class=\"sub meta\">Metacritic :"+ meta +"%</span></p></div>");
	/*
	"<div id="ratings">
	  <p><span id=\"overall\">Rating: <span id=\"overallnum\" class=\""+ colorClass +"\">"+ ratingoverall +"%</span></span></p>
	  <p><span class=\"sub tomatoes\">Rotten Tomatoes Total: "+ tomatoes +"%</span></p>
	  <p><span class=\"sub tomato\">RT critics: "+ tomato +"%</span></p>
	  <p><span class=\"sub tomatouser\">RT Users: "+ tomatoUser +"%</span></p>
	  <p><span class=\"sub imdb\">IMDb: "+ imdb +"%</span></p>
	  <p><span class=\"sub meta\">Metacritic :"+ meta +"%</span></p>
	</div>"
	*/	
}