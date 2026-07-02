////  requirement

API - for crypto Data - Crypto Data API: Most Comprehensive & Reliable Crypto Price & Market Data | CoinGecko API
u have to use the free tier and get API key
Crypto Derby
 
Objective
 
Build a web or mobile application where users participate in short-duration cryptocurrency prediction challenges.
 
The objective of each challenge is to predict which cryptocurrency will perform the best during an active game.
 
The application should provide a modern, responsive user experience while handling real-time market updates and multiplayer game state transitions.
 
 
Functional Requirements

1. User Authentication
 
Implement a simple authentication mechanism.
 
Users should be able to

-Register(simple username email and password)

-Login(using jwt token)

-Logout
 
2. Dashboard
 
The dashboard should display:
 
The dashboard should display:
Available Challenges (created by all users and open for participation)
My Active Challenge
Countdown Timer (for active challenge)
User's Virtual Wallet Balance
Previous Challenge Summary
Latest Market Overview
 
The dashboard should automatically refresh when underlying market information changes.
 
3. Create New Challenge
 
-A user can start a new challenge.

During challenge creation, the user should be able to configure:

-Challenge start time, challenge end time.
-challenge should be started at the start time, and price should be locked at this time.
-participation should be allowed only till the start time.

-Virtual amount to participate with
 
The system should automatically assign:
Challenge ID
Challenge Status
Once the challenge starts, its configuration cannot be modified.
 
4. Join Challenge
Users should be able to view all available challenges created by other users.
A user may join any available challenge before the participation freeze time.(which is until start time only)
Joining a challenge should:
Deduct the virtual entry amount from the user's wallet.
Add the user as a participant.
Prevent duplicate participation in the same challenge.
Once the participation freeze time is reached:
No additional users can join.
The participant list becomes locked.
The challenge moves to the Active state.
5. Coin Selection
 
After the challenge becomes Active:
All participants should see the same predefined list of cryptocurrencies (any top 8).
Each participant should select one cryptocurrency before the coin selection timer expires.
After confirmation:
Selection cannot be changed.
The starting market price should be locked.
The selected cryptocurrency should be associated with that participant.
If a participant fails to select a cryptocurrency before the selection timer expires, the implementation behavior is left to the developer (for example, automatic selection or marking the participant as inactive).
 
6. Active Challenge
 
During an active challenge display:
Selected Cryptocurrency
Locked Starting Price
Current Live Price
Price Movement
Percentage Change
Remaining Countdown Timer
Total Participants
The interface should continuously update market information during the active challenge.
 
6. Countdown Timer
 
-Each challenge has a fixed duration.

-The application should display

Minutes

Seconds
 
-When the timer reaches zero,

the challenge should automatically finish.
 
-The user should not be required to manually end the game.
 
8. Result Calculation
 
When the challenge ends, the application should calculate:
Starting Price
Ending Price
Percentage Price Change
The result should be calculated using price movement between the challenge start time and end time.
Calculations should be precise and avoid floating-point rounding issues.
 
9. Winner Determination
 
The winning cryptocurrency is the cryptocurrency with the highest positive percentage movement during the challenge.
Every participant who selected the winning cryptocurrency should be considered a winner.
Prize distribution strategy is left to the developer.
 
10. Result Screen
 
Display:
Winning Cryptocurrency
User's Selected Cryptocurrency
Starting Price
Ending Price
Percentage Movement
Win/Loss Status
Updated Virtual Wallet Balance
Total Participants
 
11. Challenge History
 
Users should be able to view:
Previous Challenges
Challenge Creator
Selected Cryptocurrency
Result
Winning Cryptocurrency
Duration
Profit/Loss
Participation Date
 
12. Virtual Wallet
 
Maintain a virtual wallet.
The wallet should:
Initialize the user's virtual balance from the database during account creation.
Deduct the challenge entry amount.
Credit winnings.
Display the current balance.
No real-money transactions are required.
 
No real-money transactions are required.
 
Business Rules

Rule 1

-A user can participate in only one active challenge at a time.
 
Rule 2

-A challenge remains open for participation until the Participation Freeze Time.

-After the freeze time:
No new participants may join.
Existing participants remain.
The participant list is locked.
 
Rule 3

-Once a participant selects a cryptocurrency, the selection cannot be changed.
 
Rule 4

-The starting price must be captured only once when the challenge becomes Active.
-All participants must use the same starting price.
 
Rule 5

-The ending price should be captured automatically when the challenge expires.
 
Rule 6

-Results should be generated automatically.
 
Rule 7

-A challenge automatically ends when its timer expires.

Rule 8

-If multiple cryptocurrencies finish with exactly the same percentage movement, the application should handle ties gracefully.
-The tie-breaking strategy is left to the developer.
 
Rule 9

-All calculations should maintain sufficient decimal precision to ensure fair comparison.
 
Rule 10

-Market data should be treated as read-only.

-The application must not modify market information.
 
Non-Functional Requirements

The application should

-Handle API failures gracefully.

-Display appropriate loading states.

-Display meaningful error messages.

-Avoid unnecessary repeated data requests.

-Continue functioning even if market updates temporarily fail.

-Be modular and maintainable.
 
Constraints
 
Candidates should assume the market data provider has the following limitations:

-Limited API request quota.

-Request rate limits.

-Live market prices may change at any time.

-Temporary API failures may occur.
 
The solution should be designed to use external data efficiently.
 
Final Flow -
 
Challenge Created

        │

        ▼

Status = OPEN

        │

        │ Users can join

        │ Users can select one coin

        │

        ▼

========== START TIME ==========

        │

        │ Freeze participants

        │ Freeze coin selections

        │ Lock starting prices

        ▼

Status = ACTIVE

        │

        │ Live price updates

        ▼

========== END TIME ==========

        │

        │ Fetch final prices

        │ Calculate winner

        │ Update wallet

        ▼

Status = COMPLETED
 
 
Crypto Data API: Most Comprehensive & Reliable Crypto Price & Market Data | CoinGecko API
Get reliable crypto prices and market data with CoinGecko API, trusted by 150M+ monthly users. Access rich metadata, historical charts and onchain coverage across 264 networks.
 
This is the end to end task that we have to execute , you can use any DB of your choice prefered is mongo , we are going to evalaute multiple things 
 
1- quality of output 
2- time frame
3- prompting skills
4- ability to understand the code generated 
5- how unit testing , code quality and perfromace is 
 


////chat gpt given plan.

You are a Senior Full-Stack Software Engineer and Software Architect.

We are building a production-grade Next.js full-stack application called "Crypto Derby".

==================================================
TECH STACK
==================================================

Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS

Backend
- Next.js Route Handlers
- TypeScript

Database
- MongoDB
- Mongoose

Authentication
- JWT Authentication

Crypto API
- CoinGecko Free API
- API Key from environment variables

Architecture

Controller
↓

Service
↓

Repository
↓

Model

==================================================
PROJECT RULES
==================================================

Read and strictly follow every rule inside:

- PROJECT.md
- .cursor/rules/*

Never violate project rules.

==================================================
GENERAL DEVELOPMENT RULES
==================================================

Write production-ready code only.

Use TypeScript everywhere.

Never use "any".

Never use Prisma.

Never use Sequelize.

Never write SQL.

Always use Mongoose.

Never access MongoDB directly from controllers.

Always use Repository Pattern.

Business logic belongs only inside Services.

Controllers should only:

- Validate
- Call Services
- Return standardized responses

Repositories should contain all database operations.

Models should contain schema definitions only.

Keep functions small.

Avoid duplicate code.

Prefer reusable utilities.

Use async/await only.

Follow SOLID principles.

Follow clean architecture.

Use dependency separation.

==================================================
PROJECT REQUIREMENTS
==================================================

The application is called Crypto Derby.

Users participate in short-duration cryptocurrency prediction challenges.

The objective is to predict which cryptocurrency among a predefined list performs the best during the challenge duration.

Market data comes from CoinGecko Free API.

The application should efficiently handle API limits.

==================================================
FEATURES
==================================================

1. Authentication

Implement:

- Register
- Login
- Logout

Use:

- JWT
- Password hashing

==================================================

2. Dashboard

Display:

- Available Challenges
- My Active Challenge
- Countdown
- Wallet Balance
- Previous Challenge Summary
- Latest Market Overview

Dashboard should update automatically.

==================================================

3. Challenge Creation

User can create challenge.

Configuration:

- Start Time
- End Time
- Entry Amount

System automatically generates:

- Challenge ID
- Status

Challenge becomes immutable after start.

==================================================

4. Join Challenge

Requirements:

- Join before start time
- Deduct wallet balance
- Prevent duplicate participation
- Prevent joining after freeze time

==================================================

5. Coin Selection

Participants receive same predefined Top 8 cryptocurrencies.

Each participant selects one.

Selection becomes permanent.

If timeout occurs, automatically assign one.

==================================================

6. Active Challenge

Display:

- Selected Coin
- Locked Starting Price
- Current Price
- Percentage Change
- Countdown
- Participant Count

==================================================

7. Countdown

Challenge starts automatically.

Challenge ends automatically.

No manual action required.

==================================================

8. Result Calculation

Capture:

Starting Price

Ending Price

Percentage Change

Use high precision calculations.

==================================================

9. Winner Determination

Winning coin:

Highest positive percentage gain.

All users selecting that coin win.

Handle ties gracefully.

==================================================

10. Result Screen

Display:

Winning Coin

User Coin

Starting Price

Ending Price

Percentage

Wallet Balance

Participants

==================================================

11. History

Display:

Previous Challenges

Creator

Winning Coin

Selected Coin

Duration

Profit/Loss

Participation Date

==================================================

12. Wallet

Virtual wallet only.

Features:

Initial Balance

Debit

Credit

Transaction History

==================================================
BUSINESS RULES
==================================================

- One active challenge per user.
- Joining closes at challenge start.
- Coin selection cannot change.
- Starting price captured exactly once.
- Ending price captured exactly once.
- Challenge ends automatically.
- Results generated automatically.
- Market data is read-only.
- Handle ties.
- Maintain decimal precision.

==================================================
NON FUNCTIONAL REQUIREMENTS
==================================================

Handle:

- CoinGecko failures
- Loading states
- Error handling
- Rate limits
- API quota
- Retry strategy
- Efficient caching
- Minimize unnecessary API requests

Application should remain functional during temporary API failures.

==================================================
COINGECKO
==================================================

Use CoinGecko Free API.

Store API Key in environment variables.

Implement:

- API client
- Retry mechanism
- Error handling
- Response validation
- In-memory caching
- Refresh strategy

Avoid unnecessary requests.

==================================================
BACKGROUND PROCESSING
==================================================

Implement an automatic scheduler that manages challenge lifecycle.

Responsibilities:

- Open Challenge
- Freeze Participants
- Freeze Coin Selection
- Lock Starting Prices
- Activate Challenge
- End Challenge
- Capture Ending Prices
- Calculate Winners
- Update Wallets
- Mark Challenge Completed

This should happen automatically without user interaction.

==================================================
LIVE UPDATES
==================================================

Design the application to support real-time updates.

Examples:

- Countdown
- Challenge Status
- Price Updates
- Result Updates

==================================================
SECURITY
==================================================

Implement:

- JWT Authentication
- Password Hashing
- Input Validation
- Centralized Error Handling
- Environment Variable Validation

==================================================
PERFORMANCE
==================================================

Optimize:

- MongoDB queries
- Indexes
- CoinGecko API usage
- Duplicate requests
- Response time

==================================================
IMPLEMENTATION STRATEGY
==================================================

DO NOT attempt to build the entire application in one response.

Instead:

1. Analyze the entire project.
2. Design the architecture.
3. Design MongoDB collections.
4. Design folder structure.
5. Identify reusable utilities.
6. Break the project into logical modules.
7. Produce a detailed implementation roadmap.
8. Wait for approval before generating any code.

Never skip planning.

Never generate placeholder code.

Never modify unrelated files.

Always explain the implementation plan before coding.