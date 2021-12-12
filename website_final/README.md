# Programming in life science Lab (PRA3006)
*Information regarding the detailed code functionality can be found in the comments of the code*

This code is a webpage that analyses the main types of treatment used for different types of cancers and converts all the daily dosage units of those drugs into the same predominant unit to be able to make a better comparison. The information on the webpage was retrieved from Wikidata. This project was developed during the practical Programming in Life Science offered by the Maastricht Science Programme.

- Check AUTHORS for people who contributed to the development of this website
- Check SOURCES for the sources used in the development of this website
- Our GitHub contains four branches: one main which has all the files, one with License (I don't know how I created that one ;-;), and two branches used for the submission (one test one final submission) 
- The most recent version of the website can be found under the \_\_\_ file. All the other files were uploaded throughout the practical to document the progress of the project team in developing a website to the main branch (Please don't check the early versions they are horrible).
- Submission branches contain only the final version of the website. 

## Running the code

1. Download ...
2. Run homepage HTML file...
3. Explore the drugs against cancer and their daily dosages ...

## Possible issues and known bugs:

- It is possible to not get a response from the server while making the query, if that happens the website will work however the visualizations will be unavailable.
- There is a rare bug which we encountered only once but it's worth mentioning since all the other bugs were eliminated: while going over the drugs on the drugInfo page small information can appear underneath the leftmost card that says: "This is the last slide". As already mentioned we encounter this only once and we were unable to reproduce this bug but you have been warned.

## General information on the Code Structure

The code is divided into 6 different folders:

- Drugimages
- otherimg
- Pages
- profilepic
- scripts
- styles
  where Drugimages, otherimg and profilepic contains only images.

The pages folder contains HTML files for each page of our website.
The scripts folder contains 5 javascript programs, from which 3 are used for visualization (animated_barchart.js, better_pie_chart.js, CircleChart.js) while the other two (main.js and data.js) are used for making the query and processing + preparing the data respectively.
The styles folder contains 6 different .css files. Each page has a different .css file (so 5 for each) and one .css file (style_general) that every page uses (namely the header and the footer).

## General flow of the code

For the following pages the flow of the code is relatively straightforward as it doesn't use too much besides what is already in the HTML and their respective CSS file: about.html, Contact.html, sparql.html.

## home.html flow

First, all the necessary files are loaded in the head of the HTML file, this includes making the query and preparing the data for the visualizations (last line of the head - main()). Only the d3 libraries are loaded a bit later in the code because of the compatibility issues of the pie and bar charts (see comments in the home.html for more explanation, line 13-16).

After the head is executed the body with most of its content is rendered on the website. Only the graphs with information about them (and a dialogue window) are not loaded as those are only rendered whenever the user chooses to interact with one of the given buttons. Once a button was interacted with it executes two functions: updateGraphs() and VisInfo(). The arguments for those functions depend on which button was used but overall those two functions take as input data for the pie and bar charts as well text for the titles, subtitles and any other additional text.

Upon using the + button the user gets a dialogue window in which they can make their query (it is very limited as the only part of the query that the user can influence is the search term which in the case of this website needs to be cancer). After using the search button and making a successful query, the user is informed about the results by an alert and gets access to plot the results. The new plot button works the same as all the other buttons for drawing visualizations.

The user can also interact with some other elements of this page like the navigation bar, bars of the bar chart, footer icons or text upon which the user will be redirected to the specified location. *some icons, mainly twitter, are not linked for privacy.

## druginfo.html flow

First, all the necessary files are loaded in the head of the HTML file, this includes making the query and preparing the data for the visualizations (last line of the head - main()). Here the d3 library is loaded normally in the head as there are no compatibility issues as in the home.html.

After the head is executed the body with most of its content is rendered on the website. Only the circle chart is not rendered (the cards are rendered but are out of reach for the user - remove style="overflow-x: hidden" from the body tag to see all the cards - not recommended - very ugly - undesired).

The circle chart is rendered only when the user interacts with the button underneath the disclaimer text. Using it will cause to use the draw_circle() function which takes as input the properly structure data for the circle chart.

## Adding new cancer to the website

This is relatively simple to achieve - in the home.html a new button needs to be added with the name of cancer. This button will use the same functions as all the other buttons for cancers but it will take as input the data for this specific cancer. To get this data the Q term for this cancer needs to be added to the main_terms variable in the main.js. After that in the data.js variables for new cancer need to be initialized. Those are: new_cancer_str (which actually is a string inside of an array; top of the file), new_cancer_forPie, dominant_new_cancer, bar_chart_data_new_cancer and bar_chart_new_cancer_title (all of which can be found in the main() function of the data.js). This will produce a visualization for new cancer (pie, bar and circle charts). Keep in mind that if the new_cancer does not have any drugs used to treat it, or those drugs does not contain the specified daily dosage property, then pie and bar charts will be empty.

Additionally, adding new information on the drugs of new cancer needs to be done manually. That means that in the druginfo.html inside the "swiper-wrapper" div a new div "card" needs to be added for each drug of new cancer. There the name, image and text have to be manually specified by the programmer (since the purpose of these drug cards are to summerise and provide quick info to the user, instead of loading with information).

## Modifying the query

The query can be found in the main.js script. It can be modified simply by editing the string and the searchTerms but this is not recommended as the whole website is adapted to the information which is received from the current query.
