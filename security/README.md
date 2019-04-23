1. So, I obvioulsy was not really able to find the security vulnerabilities
I set out to find. My comment about posting "NaN" for geolocation on the web 
page is valid, but for the 3 security concerns I brought up, they were either
already prevented by my partner's code, or blocked by the browser. I am fairly
confident that although both Chrome and Safari blocked my XSS attempt, that this
issue is still a valid security concern in the scope of my partner's program.
That being said, I obviously must admit that I didn't knock this assignment
out of the park.
2. My partner had warned me prior to testing that the [$ne] injection would
not work on his code. We discussed together why this might be the case with
his program, and not with mine, ultimately concuding that it had to do with
how we differed in our checking of the data in the database.
3. I spent about 30 min reading up on XSS and mongoDB injections, 2 hours in 
Halligan working with the TA to try to find vulnerabilities (to little result),
and another 1.5 hours typing up what I had found. Total 4 hours.