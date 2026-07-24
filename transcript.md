I'm gonna teach you how to defeat the monster known as AI Slope
in three simple steps. Now,
AI Slope has taken a number of forms over the years,
and it wasn't too long ago that it looked something like this.
A generic SASS template with Interfont everywhere and blue
purple gradients. But now AI Slop looks something like this.
This is definitely better,
but it still screams AI. It has a specific color palette,
a specific font, just a general style that right away
you can tell this was generated in just a prompt or two.
But today, I'm gonna show you how to break out of this mold.
I'm gonna teach you how to cultivate
and inject your own taste into the web design process.
I'm gonna show you what sort of skills
and MCP's you need to begin using
to help you in that endeavor.
And lastly, I'm gonna show you the exact sort of build sequence
you need to begin applying to this.
What are the prompts we should be using?
How should we be prototyping?
What does it mean to iterate and tweak our web design
until we get something we actually like?
And by the end, you're gonna have a flexible roadmap
that you can apply to all of your AI design work.
So let's get started. AI has no taste.
Now, this is a phrase you've definitely heard of before,
but it's an important one,
and it's what step one is all about.
Because step one is figuring out how do we cultivate taste?
How do we curate it? How do we bring that into the web design process?
Because the problem with this website
and this website isn't a technical one.
It's simply generic. And no matter how good the models get,
they could get 10 times better tomorrow.
It'll just change what we consider to be generic.
But instead, if we are able to inject our taste into the design process,
we are going to be able to create something that is unique
because it's specific to you and it's very subjective,
but also something that is quote unquote good.
So for step one, what we are going to do is
we are going to curate a library of design inspiration.
This is also going to help us cultivate our own taste.
We're going to expose ourselves to a lot of,
you know, high level web design or whatever you want to call it.
And once we have this library of stuff we like,
you know, this is a reflection of our taste,
we can then bring that to AI
and use that as the foundation
for what we are going to build moving forward
instead of relying on nothing
and instead just getting an average regression to the mean output.
So where should you go to find inspiration?
Well, there's a number of websites that I think do a really good job.
What I'm on right now is dribble.
That's Dribble with three B's.
I just typed in web design,
put in popular, and I can see a bunch of different landing pages.
Another good one is Pinterest.
Again, alls I did was throw in web design
and what do I see? I see a bunch of hero pages
that are much different than what Claude is gonna generate me
when I say build me a landing page.
And lastly, we got Twitter,
which I think is my favourite of the bunch,
because there are a ton of awesome creators in this space
that are doing really cool design work
and UI stuff that you just aren't gonna see anywhere else.
And so your first job is simply to go to these websites,
start looking for things you like,
and just start screenshotting them,
saving them.
You can even save links if you have the actual websites themselves.
And once you do that,
you can just leave all those screenshots in a screenshot folder.
Or you can do what I did and have Claude Code
create a simple web app as essentially your inspiration library.
It's gonna put everything in one place,
but more importantly, it's gonna group them based on design type,
and you can have it explain what the design even is,
what it means,
what is the actual vocabulary associated with this design.
And when I click on one of these screenshots,
it gives me some keywords associated with its design.
So this is something like a Voxel
rendered landscape. And then down here I can both copy the image prompt.
if I wanted to create an image for my hero section in the background,
like this one, this sort of gives me the foundation for that.
And then I also this button that says Copy Brief.
And that's something I would use
to actually create the website in its entirety.
And we'll go into prompting and all that in step three.
Big picture, step one is cultivating our taste.
It's creating this library of inspiration.
So you don't just have to sit there
and come up with something from scratch.
Just come up with something,
you know, that's been sitting in your brain.
Because when we're just getting started,
we're really not good enough for that yet.
We need to find stuff that's actually working that we like
and use that as our base. Now step two is all about the external tools.
We are gonna give Claude code so that when we move on to step three,
which is actually creating the website,
it gives us better outputs right away.
And the first one I wanna talk about is impeccable,
which I think is the best front end design skill in the game right now.
Now impeccable is an open source tool.
It's got almost 50,000 stars on Github.
And speaking of Github,
they now turned it into like an official part of Gethubs AI tool.
And it's one skill, but it includes 23
Different commands that will essentially improve your web design
or your website's components in a number of different ways.
So it's able to, you know,
critique any issues. It's able to add additional polish,
make it bolder, make it quieter,
etcetera, etcetera.
There's 23 different things.
Now, it's kind of impossible to understand what those 23 things do
without seeing them in action.
But if you go into the actual impeccable website,
which is impeccable dot style,
we can see all those 23 different commands over here on the left.
So if I look at Boulder, for example,
it explains what it does.
It pushes safe designs towards impact without sliding into chaos.
And over here on the left,
this would just be, like a standard code output.
And if I do impeccable Boulder, well,
I get something like this.
Or if I do something like overdrive, hey,
here's, you know,
standard claw code, and then here's impeccable or clarify.
Here's the standard warnings you get.
And here's something that is a bit more condensed
and easy to understand. And really,
what impeccable is doing is it's identifying and getting rid of slop.
And it does that across, really,
seven different places. Typography,
color, spatial design,
responsiveness, interaction,
motion, and actual UX writing.
They have an entire section of their website dedicated to slop,
and it breaks it down as 46 different patterns.
And you can actually run the impeccable CLI,
and we'll look through everything to see, okay,
like Is this quote unquote AI slop?
And it'll actually show it to you on a dev server.
Speaking of a dev server, they also have live mode,
so you can actually bring up your website
and you can actually click through it component by component
and make adjustments right there. Live.
So it's almost like clawed design in it in one sense,
but it definitely gives you a visual aspect
that you can't get if you're using exclusively the terminal.
Now to install this is super easy.
It includes a CLI
and they give you three different options for installing this thing.
And if you get confused, just go ahead,
copy the URL and drop that into Claude code
and it will install it for you.
Now, if you don't really like impeccable,
another one I would suggest is the taste skill.
They just released their version 2,
although it's experimental again,
we can find this on Github.
It's just under 66,000 stars and sort of works in the same manner.
You know, it's going to look for those AI sort of like slop tells,
and instead it's going to give you a stronger layout,
it's going to work on the typography,
motion and spacing, and in the end
it's meant to give you something unique
instead of a boilerplate looking UI.
So I think these two, the taste skill and impeccable,
are the best in the game right now.
Definitely a step above the standard anthropic front and design
And definitely a step above some of the more popular repos like UI
UX Pro Max. Now when we talk about mcp's,
the one I use the most is the Higgs Field MCP.
And this is because it's going to give Claude code
capabilities it simply does not have
out of the box. Primarily image creation and video creation.
So the Hicksfield MCP is gonna give you access to
virtually every single AI
image and video generator out there.
So I usually use GPT images too for images
and then for video that's usually bouncing around every few weeks,
but right now C dance tends to be the best.
So you can also install this as a CLI.
To actually get here, all you have to do is go to the haigfield website,
haigfield dot AI, go to MCP and CLI,
just copy this, paste it into Claude code,
and then it will run you through the authentication process.
It also has some skills you can add here as well.
And once this is installed,
if we're trying to create a website where,
especially if we wanna add some sort of like
hero imagery right in the background,
it just calls on the MCP and it will generate it for you.
Furthermore, if we wanna generate custom assets,
this can allow us to do it as well.
And one last thing I wanted to talk about isn't really a scale
or even an MCP, but that is 21st dot dev
And this is kind of something
you could probably even throw in step one
in terms of the taste thing.
But this is all about components.
So let's say I was looking for specific buttons.
So if I come over here on the left and I click buttons,
I'm gonna see a bunch of different buttons.
And if I click on any of these buttons,
I then have the ability to copy the prompt.
So down here it says copy prompt.
If I copy that and paste that in a code,
it will give me a button that looks like this.
And there isn't just buttons.
There's cards, there's,
you know, pricing sections.
So, similar to,
you know, in step one,
where we were really looking at sort of, like,
big picture in terms of design and aesthetics,
this is a great place to go to get inspiration for specific components.
So we're just getting more detailed and, like,
a little lower level and this sort of stuff.
But even here, it will have things. Again,
it will do, um, borders,
backgrounds, calls to action.
So, again,
this is just all in the same vein of, like,
exposing ourselves to things we otherwise wouldn't even think about.
Like, how much.
How often are you looking at, like,
pagination and the different options we have for that?
Now, the last thing I'll say at this step is
beware going down the rabbit hole in terms of tools and skills,
because it's Very easy to fall into the trap of, well,
I'm just one skill away from, like,
all my design problems being solved.
You'll probably see some really cool skills out there
that build really cool websites.
The issue is, those tend to be very narrow in scope.
They're extremely prescriptive,
and oftentimes, those skills will only give you one kind of output.
The reason why I suggest the taste skill,
and I suggest impeccable and Hicksville,
because they're very flexible,
and we can go a number of different directions with them.
However, because they are not prescriptive,
they aren't always gonna give you a quote,
unquote great output,
because that great output is gonna depend on your prompting.
And, again,
how we inject taste. And now,
in step 3 is where we kind of put it all together.
I'm gonna show you how you should prompt,
and more importantly,
how you should iterate until you get an output you like.
So now we're into step three,
which is the actual build phase.
And what I want you to get away from
is the idea that we need to one shot these things.
What we instead need to do,
and what I suggest, is cast a very wide net off the bat.
What you see here is
I had it create a website for this fake AI company called Argus,
and I had it create five different versions in five different styles.
And also what you see over here is on One hand
on the left hand side, I had it use impeccable,
and on the right, I had it use the taste skill.
And the idea is, when we first start prompting this guy,
we want to see a bunch of different styles
of the website we're trying to create.
I like to do five. Once we see all five,
we probably have a decent idea of, like, okay,
this is the direction I wanna go.
Once we choose that one, like,
let's say I did print tech,
then we wanna do some iterations on that.
I have it do, like,
three versions of that style,
and then for those three versions,
I pick one, and then we tinker.
The idea is I wanna see all my options on one screen at one time.
It's kind of tough, I think,
to know what direction you even wanna go on or go through
when you're just sitting inside a terminal
and you just try one thing and then you try another.
Like, why don't we just try a bunch of stuff at once
and compare and contrast? That's sort of my idea.
And once we get a little more,
you know, sort of fidelity in terms of what style we want to go into,
then we bring in things like the Hicksville MCP
and start generating assets,
generating hero images, and doing all that cool stuff.
Now, in regards to prompting,
this is kind of how I like to go about It.
I really have four different things
I am gonna pass to AI when I prompt.
And again, it's not prescriptive,
it's not overly specific.
It's not some 10,000 page design dot MD prompt you need to copy.
Cause remember when people give you that,
it's gonna be kind of the same thing every time.
It's very narrow. And what I think you wanna pass is first,
the aesthetic, right?
What is the general, like,
family of design we want this website to sort of follow?
Secondly, we wanna give it some sort of reference image.
This is where our sort of curated,
like, taste library comes into play.
There's probably some sort of website
or multiple websites you wanna drop here in terms of the reference.
And what we're trying to do is we're trying to match the feel.
We aren't necessarily trying to match it,
you know,
content wise or design wise,
because we're not trying to like,
copy them. Again,
we're going for a feeling and aesthetic.
Number three is the intent.
What are we building and why?
Like, is this a Sass product?
Is this something for an event?
Who is the target audience?
What are we trying to have them do?
Do we want them to just like,
read everything and that's it?
Do we want them to click through something,
fill out some sort of form?
These things are important
and they're gonna dictate what the rest of the website looks like.
And then Lastly, what are some sort of guardrails?
What are things we always wanted to do,
and what are some things we never want it to do?
This can become useful in terms of, like,
AI slop, stuff like,
I never want purple gradients,
I never want interfont and things of that nature.
Also in terms of references,
don't be afraid to drop actual website URLs.
If there's a website you like and you kind of want it to match,
again, sort of the feel and style,
drop that as well. It doesn't just have to be screenshots,
but this, I think,
is sort of a great place to start.
And again, we're not trying to one shot,
we just want to get something moving in the right direction.
Now, when we prompt this,
like I said, I want a bunch of different,
you know, design styles.
And this kind of comes back to my taste library.
Cause if you built this like I suggested you do,
it's already kind of broken it out into different libraries, right?
I have print tech paper style,
I have dither mono. Kind of this,
like, fast,
quiet, cinematic style.
And so for me, I can just tell Claude, Code, hey,
take a look at my library and pick out,
you know,
five different aesthetic families and create websites like that.
Or if you haven't built something like that,
you need to actually tell it specifically, like, hey,
I want five different variations and five Different styles.
That works, too.
So what we're gonna do is
we're gonna use this prompt and start walking through it ourselves.
So here's the prompt I gave it.
I said, build a landing page for Kestrel,
an AI analytics platform for small startups.
I give it the intent and what we're trying to actually do, right?
We want them to actually book a demo.
We have some guard rails. I'm saying for pretty much all the hero pages,
we're gonna have, like,
a monumental image. And I wanted to never do the AI slop stuff.
Things like purple gradients,
3D sass blobs, that kind of thing.
I say I wanted to create five versions of the page,
and then for each version,
I break down the direction.
So I specify the aesthetic.
I give it a reference image. Again,
that's coming from my taste library.
Remember this thing?
And then I mention what the future hero will probably look like.
And I do that for all five versions.
So let's see what it comes up with.
So here are the five it created.
Here's sort of the print tech paper version.
Got the data as texture. Remember,
all these graphics were all just generated by cloth code.
I haven't used anything
like the HQ MCP to actually create the graphics.
We have sort of the vast, quiet one.
This is supposed to be like a stand in for some sort of, like,
mountain range we would create.
We have Diddle mono.
And then we have classical remix.
So, again,
remember, we're just kind of looking,
like, big picture.
What sort of style do I like?
Hmm.
Kind of
dither mono looks kind of cool.
I kind of think the vast, quiet looks kind of sick.
It's definitely different.
Very minimalist. But I kind of like what it's doing.
And I think this might look really cool
if we can nail the actual image behind it.
So I'm gonna go with sort of this vast,
quiet direction. And now
what I'm going to do is I'm gonna ask it to essentially
create three different versions of this.
Specifically, when we look at the body,
I wanna just kinda, like,
see what's possible out there.
So I said, let's go with the vast,
quiet version. Generate three versions of that aesthetic for me,
namely, changing the body, formats, etc.
And you can get specific about what you wanna see different with it.
And so, just like we did here,
it's gonna be three versions of this,
then we'll nail down the one we like,
and then we can get a little more specific
when it comes to changing components,
doing tweaks to fonts and colors,
and then actually generating the assets.
So it's coming with a few more variants.
Here's the original, right?
Very minimal, very vertical.
Here is the second one, which also kind of has that calm approach,
but it looks like it's kind of added a little bit More to the body.
Here's one where it's more of a Ledger.
It's kind of shifted a few things over to the left.
And now we have this index that scrolls along with us,
which I actually kind of like.
Then we have this one which it called frames.
Okay, so everything's kind of like.
You see
kind of how has these edges on the side that frames each section.
To be honest, I kind of like the Ledger. Um,
I kind of like how when you scroll down, um,
this follows you on the left hand side.
Um, maybe we add something to the right a little bit.
Not totally sure, but I like this.
It's kind of like a neat, minimal approach,
yet looks a little bit different.
And so what I'm gonna tell it now is, hey,
we're gonna go with version 3 B,
which is the Quiet Ledger version.
And what I wanna do now is I wanna nail the hero image first.
I think if I nail this background,
then I'll begin playing around,
you know, with, like,
fonts and where things are kind of sitting.
So the prompt I'm gonna give it is,
let's go with the V3B, which is the Ledger version.
And what I wanna do now is nail that hero image.
So you have the, you know,
examples of the hero images that are part of the quiet aesthetic
that's on our Inspiration Library.
I think there's like three or four Of them.
So can you create like,
give me like four different images that fit this?
That would also fit our hero image specifically. Right?
The whole like, composition of it.
So, um,
use the Higgs field MCP for that.
Make them high quality, make them 2K,
and create four different designs,
and then pull them up once you do that.
So Claude Code called the Higgs Field MCP,
created some images, threw it into the hero section,
and now it's displaying those different ones.
So this is the first version,
which is the aerial. We have the crag,
then we have almost this like,
watercolor type painting, which I think is cool.
And then it did the Cloud Sea.
Now I kind of like.
Honestly not a huge fan of 2,
cause I feel like it overlaps some of the text.
But I do like. I like No. 1 and 4. I think.
I think one looks pretty cool.
But maybe if we could add,
I don't know, like a splash of color somewhere,
just cause it's very black and white,
and maybe just like some semblance of color would look good.
So that's what I'm gonna tell it.
Can we go with option 4 that you created?
And can you create multiple versions of that
and show me just like you did before?
But can we add maybe a little color to it?
Right now it's very black and white.
I'm not sure if just a splash of Color somewhere would look good.
So created some variations.
So here's the original here.
It added a little color called a Dawn Touch,
Golden Hour, Albin Glow,
and then the Duo Tone, which is way too much. Um,
and of all these, I think I like the Alpin Glow,
so we're gonna go with that.
Let's go with the Alpin Glow version,
and then go ahead and bring up our webpage with that as the hero.
When you do that, make sure you take a look at the transitions
between the hero and the body.
It shouldn't just be, like,
a super sudden change.
So do what you need to make that look sort of premium.
And then in terms of, like,
page loading, um,
we want everything to feel kind of,
like, heavy, um,
and give some weight to it.
So here's what we got. All the stuff kind of loads in one by one,
which I like. As we scroll down,
it's not like a hard transition,
so it kind of just, you know,
slowly fades out, and then.
Yeah, I like.
I kind of. I really like this index, honestly.
I think it looks really cool.
Then at the bottom, we have book a demo.
Now, overall,
very minimal, but it kind of fits the vibe.
At this point, I kind of just want to start tweaking different things
and maybe see if we can add just a little bit more,
I don't know, punch to it.
So it isn't overly minimal,
but honestly I, I kind of think it fits.
And so I think the easiest way to do that,
instead of just sort of guessing and being like, uh,
make it look more premium.
I want to add stuff is to add.
Have it add a tweaks bar.
And this is something you see inside a claw design.
And so that prompt will look something like this.
Can we sort of mimic what happens inside a claw design and add like
a tweak bar that pops up on this dev server?
So I can change a number of things,
whether that's font size, font type,
accent, colors.
Basically any place where you think there's a decision to be made
in terms of the overall aesthetic and design.
Especially when looking at the body,
cause I do like the hero. Um,
I want an ability to tweak that on the tweaks page.
So go pretty aggressive with what you offer me.
And while it builds that,
the other thing I want to talk about is sort of references.
So a lot of this today has been,
you know, when we've talked about inspiration and building references
has been in regards to the hero section.
Right. The first thing you see,
but that also applies to the body.
So just like we've given it screenshots,
you can do the same for the body.
And in fact,
you can give it actual URLs of websites you like and Be like, hey,
like, take a look at the actual, like,
formatting of that website,
cause Claude Goode can see it
and I want it applied to my page.
And just like, we've created this library of inspiration.
You can do the same for stuff that isn't a hero. Again,
it can just be how a, you know,
the body of a website is laid out.
Okay, so now you can see over here on the bottom right,
I'll shift over here. We have this tweaks button.
So when I pull up the tweaks again,
similar to claw design, I can start changing a bunch of stuff
so I can change the heading,
font. And like, I.
This is just all built on the idea that, like,
I need to see the differences.
I don't know what fonts gonna look good.
I don't wanna sit here and ask Claude Code
to then create 10 different versions of the webpage
with different fonts. Like,
just give me some sort of, like,
thing like this. Right?
I think being able to, like,
iterate visually very quickly
is what allows us to eventually get something we like.
So we can, huh,
don't like the italics,
change the size, all this good stuff.
And like I said, I totally get pretty aggressive.
So it has like, the hero imagery,
the assets, the motion,
the weight, the reveal distance,
all this stuff. And so at this point,
it's really just a matter of tweaking it.
Over and over again, showing it more references of things you like
until you get it to a place you're happy with.
And really, this entire video has been about that.
It's about giving you a flexible workflow,
a series of steps that you can follow
to get you to a place you're happy with.
None of this is meant to be prescriptive.
None of this needs to be followed to a T.
Instead, it's about some, like,
general rules and guidelines of figuring out, okay,
what do I actually like? You know,
cultivating that taste.
How do I then take that taste and bring it to A I.
Or some additional tools that cloud code doesn't come with
that can help me do a better job of that?
And then lastly, how do I tweak,
how do I iterate so I'm not just at the mercy of Claude Code one shots
and just playing the lottery game of putting in a random prompt
saying please make it look more premium
and praying that the output is good.
So with all that said, that is where I'm gonna leave you guys for today.
As always, let me know what you thought.
Make sure to check out Chase AI plus
if you wanna get your hands on more codec guides,
especially my codec masterclass.
They'll be linked to that down in the pinned comments.
And I'll see you around.