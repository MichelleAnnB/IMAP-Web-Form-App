Hey guys! Just wanted to drop a quick breakdown of how the hidden developer dashboard/console works in our project so we're all on the same page for testing.

Basically, our app behaves like a small offline database. When you fill out the application form and hit submit, it intercepts the data and splits it into 3 clean relational tables (following the exact schemas we planned).

How to open it:
Since it's an admin tool, it's hidden by default on the success page. To toggle it open, go to the 'Thank you!' screen after submitting a form and press this shortcut together:
👉 Ctrl + Shift + D 👀😏

What’s inside:
APPLICATION_INFORMATION

PATIENT_INFORMATION

RELATIVE_INFORMATION

The cool features to look out for:
The ID Keys (int 7): Every time you submit, the script automatically generates random, matching 7-digit numbers to link the tables together (Primary Keys & Foreign Keys). If you check the text boxes, you'll see the numbers line up perfectly across the data strings.

CSV Downloads: There are direct download buttons under each text console box. If you click them, it builds a real .csv file straight out of the browser memory (Blob processing) so you can download the spreadsheets instantly and test importing them into a real database.

Let me know if the shortcut isn't opening for anyone or if you spot any bugs while downloading the tables~!
