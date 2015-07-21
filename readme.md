# Interview Test

A website for testing job interview applicants, providing a simple way of setting up questions and answers. It allows employers to create tests, with a set of questions (with notes and answers to aid marking). It also allows potential employees to attempt the test, and records their answers for employees to use.

It is primarily aimed at software development positions at the moment. The questions can contain code samples. The answers can also contain code. For simplicity, both the questions and answers will be edited as markdown.

## Contributing

To contribute, clone the repository, and run `npm install` (you need nodejs installed to do this). To run the website, it's useful to create a `Procfile` with the following content:

    web: supervisor ./bin/www

(For this you also must have supervisor installed).

You must also have a `.env` file with environment variables. Specifically, you need to add a `CLOUDANT_URL` to the env file to be able to connect to the couch database (it does not need to be Cloudant specifically, but that's what we're using).

The to start the website, then run `nf start`. This requires that you've installed `node-foreman`.


## General Design

The project is mainly in the design phase.

The home screen will say what the website is, and present the user with two options: are you here as an employer or an employee? The new user will click the appropriate button.

As an employee, the user will type the name of the company they want to test for. In the early days we'll keep this list reasonably private, since there won't be many companies. The user can click on the company.

The most fundamental operation will be where a company sets up a profile, and creates tests. Each test has a dedicated private URL. The test URL can be sent to an applicant to compete. The applicant will click the URL and it will open a start page for the test. The start page will show the company name and logo, the name of the test, and a short description or the test, including the time  duration, perhaps the number of questions, and a note about the process and format, and say that the test should only be taken once (if that's true). To start a new test, type your email address and click start. (Note about email address being used for identity purposes only, and no spam)

We can expect that sometimes multiple applicants will use the same computer to complete the test. For example if the computer is at a recruitment agency or in an interview room. But we also want the applicant to be able to resume the test if their Internet or browser fails (or the server fails for some reason). I think the easiest way to do this is to maintain a list of test sessions in the web session. If the email address matches the session then that test session is resumed.

The first page of the test will say something about completing the test yourself. At this point the timer won't be counting.

Every time the user makes a change on the answer sheet, the test state is sent to the server. Additionally, every 10 seconds or so the countdown state is sent to the server, so that the countdown on the server state can be kept reasonably accurate. This records the time, but also the number of minutes spent on the test. If the user comes back to the same test, the number of minutes will be used to calculate the remaining time. The time will go back at most 10 seconds. If the user closes the window to work on a problem, he will have bonus time. However when the results are sent to the server it should be obvious that this time has been skipped.

The layout for the test page will be a single page with all the questions. There will be a test title at the top, followed by a description, and any instructions (these were also listed on the start page, but are repeated here for convenience). Each question will have a simple title saying "Question 1", etc. This will not be part of the actual question content.

The question content will be markdown rendered to HTML, and optionally include code blocks.

For the moment, questions can only have 1 part. If there are "a" and "b" sections, these will just have to be different questions.

Each question follows with an answer block. This has a subheading "answer", and follows with a text block. Under the block is a button that says "preview". If the user is focused on the block, or if there is no content, then the block is simply a text area. If the user defocuses by moving to a different answer block, or by clicking "preview", and there is text in the block, then the text is rendered to markdown and placed within a visually delimiting rectangle. Headings in the markdown start at level 3. The cursor for the rectangle is an edit cursor (or a pointer with the hover text "edit"), and when the user clicks it it goes back into edit mode.

The markdown answers are intended to allow the applicant to write a lot, as opposed to multiple choice which doesn't give much insight into the persons thinking.

There is a little toolbar at the bottom that says "saved" or "saving" or "modified". Pressing ctrl+s saves the work so far (possibly). Saving happens automatically when an answer is defocused.

At the top of the page is a time counter. If the test is timed then it counts down, and if it isn't then it counts up. It also shows "started at" to illustrate that even if they've subverted the system by keeping the window closed, it will be obvious to the marker that they potentially had more time.

At the bottom of the test is a box for any additional notes or comments to the examiner (says optional). This is the part where they can make excuses if they feel the need.

If the user runs out of time, the time bar shows red, and comes up with a message saying that they're out of time. They may continue making changes and adding answers, and it is up to the examiner whether to accept those answers. (there should be a note on the instruction page about what happens at this point). It tells the user that all answers have been recorded, and any modifications will also be available to the examiner to choose to use or ignore.

At the bottom of the page, after the additional comments section, there is a submit button. For the moment there will be no cancel button. Next to the submit button will be a checkbox saying that the user certifies that this is his own work.

Once submitted, the user will be presented with a page that says that the test was successfully submitted. It will then have a button to log out. Logging out will end the test session and go back to the test page. If multiple candidates are using the computer, this will give the next a chance to do the test. If the same user tries again, it will simply open up his test session again (probably in the "overtime" mode). If the test session is more than a few days old then it shouldn't be resumed and will be treated as new.

If a user opens up the same test on a different computer, we don't want to show his private results, or perhaps even if he took the test, because he does not require a password and this would be a method of leaking private information to other companies (eg by typing the name of a candidate into a competitor's test to see if the candidate completed it and may even what their comments and answers were). In this case, the candidate would just be able to submit again. In the additional comments section they could specify what happened that made them lose their session (or just notify whoever gave them the test).


## Shortest proof of concept

To get a minimum working website, the main thing we want is the applicant's side, and we can manually set up tests with direct access to the database.

The website is built on Ember, but doesn't use Ember CLI or Ember Data, because at least at this stage it doesn't require the complexity. There are no build steps required, which makes for very fast development. It also means that files can be changed directly in the Chrome inspector, which is also a major benefit (with the exception of styles, which are compiled on the fly).





