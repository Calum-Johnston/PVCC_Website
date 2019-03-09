-- phpMyAdmin SQL Dump
-- version 4.8.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Mar 09, 2019 at 12:59 PM
-- Server version: 5.7.24
-- PHP Version: 7.2.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pvcc`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
CREATE TABLE IF NOT EXISTS `activities` (
  `activityId` int(11) NOT NULL AUTO_INCREMENT,
  `activityName` varchar(40) NOT NULL,
  `activityDescription` varchar(2000) NOT NULL,
  `activityImage` varchar(2000) NOT NULL,
  PRIMARY KEY (`activityId`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`activityId`, `activityName`, `activityDescription`, `activityImage`) VALUES
(1, 'Fast Feet Football Academy', 'Fast Feet Football Academy formed in January 2013 with the aim of helping children maximise their potential and become as comfortable and competent with the football as possible. Our methods are suitable for all ages and abilities but specifically players aged 3 to 16.\r\n\r\nOur emphasis is based on each child’s long term individual development, focusing on individual skill development and small group play, improving every player regardless of age or ability.  Players are encouraged to express themselves, be creative and most importantly, to be instinctive and spontaneous in their play.\r\n\r\nTo book 3 taster sessions for the price of 2, please contact us on 0191 4813469.', 'fastfeet.jpg'),
(2, 'Children’s Gymnastics Coaching', 'Our Gymnastics coaching is an ideal way of introducing your child to the activity, involving them physically and for them to meet new friends.\r\n\r\nHead Coach Lyn Armstrong has been coaching young people for over 25 years and has a wealth of experience and many of her previous young pupils have gone on to take both their coaching badges and to help organise the sessions. Those young people who attend the classes are given the opportunity to gain various B.A.G.A. awards and badges.\r\n\r\nIn addition to the courses we operate there are regular special coaching classes (Taster Sessions) organised for the School holiday periods and details will be shown on this website.\r\n\r\nNext set of classes commence in January 2016, why not check out availability on current courses.\r\n', 'gymnastics.jpg'),
(3, 'Dance Moves', 'A great class.', 'dancemoves.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `bookedevents`
--

DROP TABLE IF EXISTS `bookedevents`;
CREATE TABLE IF NOT EXISTS `bookedevents` (
  `bookedeventId` varchar(200) NOT NULL,
  `calendarEventId` varchar(200) NOT NULL,
  `timestamp` date NOT NULL,
  PRIMARY KEY (`bookedeventId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `commonevents`
--

DROP TABLE IF EXISTS `commonevents`;
CREATE TABLE IF NOT EXISTS `commonevents` (
  `eventId` int(11) NOT NULL AUTO_INCREMENT,
  `eventName` varchar(200) NOT NULL,
  `eventDescription` varchar(2000) NOT NULL,
  PRIMARY KEY (`eventId`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `commonevents`
--

INSERT INTO `commonevents` (`eventId`, `eventName`, `eventDescription`) VALUES
(1, 'Birthday Party', 'Perfect for if you want to celebrate your birhtday with catering.'),
(2, 'Computer Class', 'Learn how to program and have fun!'),
(3, 'Football Match', 'Good event for outdoors fun and a place to eat.'),
(4, 'Pantomime', 'Come and watch this hilarious play!'),
(5, 'Custom', 'Anything you want!');

-- --------------------------------------------------------

--
-- Table structure for table `eventrooms`
--

DROP TABLE IF EXISTS `eventrooms`;
CREATE TABLE IF NOT EXISTS `eventrooms` (
  `eventId` int(11) NOT NULL,
  `roomId` int(11) NOT NULL,
  PRIMARY KEY (`eventId`,`roomId`),
  KEY `roomId` (`roomId`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `eventrooms`
--

INSERT INTO `eventrooms` (`eventId`, `roomId`) VALUES
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 14),
(2, 2),
(2, 3),
(2, 4),
(2, 6),
(2, 7),
(3, 1),
(3, 8),
(3, 9),
(3, 10),
(3, 11),
(3, 12),
(4, 5),
(4, 13),
(4, 15),
(5, 1),
(5, 2),
(5, 3),
(5, 4),
(5, 5),
(5, 6),
(5, 7),
(5, 8),
(5, 9),
(5, 10),
(5, 11),
(5, 12),
(5, 13),
(5, 14),
(5, 15);

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
CREATE TABLE IF NOT EXISTS `rooms` (
  `roomId` varchar(200) NOT NULL,
  `roomName` varchar(40) NOT NULL,
  `roomDescription` varchar(2000) NOT NULL,
  `roomImage` varchar(2000) NOT NULL,
  `roomType` varchar(30) NOT NULL DEFAULT 'misc',
  `price` int(11) NOT NULL,
  PRIMARY KEY (`roomId`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`roomId`, `roomName`, `roomDescription`, `roomImage`, `roomType`, `price`) VALUES
('1', 'Astro Turf', 'The multi-use games area has been newly refurbished and is a high class, floodlit facility available until 9pm each night.  It can be hired as a full or half pitch, depending upon the age group of user or the activity required. Because it is composed of synthetic carpet, it can be used for a host of sports, including football, netball and tennis. Free parking is available on site.', 'astroturf.jpg', 'sports', 20),
('2', 'Classroom 1', 'The award winning Community Centre holds classrooms of differing sizes and thus can play host to a wide range of activities, including ICT and computing lessons. Because there are no fixed fittings, each room has the capability to act as a venue for meetings or interviews as well as adult education, with the largest being ideal for a birthday party.', 'classroom.jpg', 'misc', 20),
('3', 'Classroom 2', 'The award winning Community Centre holds classrooms of differing sizes and thus can play host to a wide range of activities, including ICT and computing lessons. Because there are no fixed fittings, each room has the capability to act as a venue for meetings or interviews as well as adult education, with the largest being ideal for a birthday party.', 'classroom.jpg', 'misc', 20),
('4', 'Classroom 3', 'The award winning Community Centre holds classrooms of differing sizes and thus can play host to a wide range of activities, including ICT and computing lessons. Because there are no fixed fittings, each room has the capability to act as a venue for meetings or interviews as well as adult education, with the largest being ideal for a birthday party.', 'classroom.jpg', 'misc', 20),
('5', 'Dining Hall', 'The Dining Hall is a bright, heated large area which could be used for a whole host of activities, ranging from formal dining to dance and fitness related sessions. Catering, both formal and informal, can be provided in this area and licenced events could be held.', 'dininghall.jpg', 'misc', 20),
('6', 'IT Suite 1', 'The IT Suite is equipped with 21 desk top computers. This multipurpose room can be used as a general class room as monitors can be lowered into the purpose built desks. The room is spacious with additional round tables to allow for group working.', 'itsuite.jpg', 'technology', 20),
('7', 'IT Suite 2', 'The IT Suite is equipped with 21 desk top computers. This multipurpose room can be used as a general class room as monitors can be lowered into the purpose built desks. The room is spacious with additional round tables to allow for group working.', 'itsuite.jpg', 'technology', 20),
('8', 'Sports Field 1', 'With a long-jump pit and two football pitches of varying size, this is an ideal venue to book for any outdoor event or field sports. It is spacious, well looked after and sheltered, as well as enjoying easy access to community facilities.', 'sportsfield.jpg', 'sports', 20),
('9', 'Sports Field 2', 'With a long-jump pit and two football pitches of varying size, this is an ideal venue to book for any outdoor event or field sports. It is spacious, well looked after and sheltered, as well as enjoying easy access to community facilities.', 'sportsfield.jpg', 'sports', 20),
('10', 'Sports Field 3', 'With a long-jump pit and two football pitches of varying size, this is an ideal venue to book for any outdoor event or field sports. It is spacious, well looked after and sheltered, as well as enjoying easy access to community facilities.', 'sportsfield.jpg', 'sports', 20),
('11', 'Sports Field 4', 'With a long-jump pit and two football pitches of varying size, this is an ideal venue to book for any outdoor event or field sports. It is spacious, well looked after and sheltered, as well as enjoying easy access to community facilities.', 'sportsfield.jpg', 'sports', 20),
('12', 'Sports Hall', 'The size of the Sports Hall makes it incredibly flexible and thus user-friendly. At its largest, it is ideal for sports like indoor football (5 a side and its variants) and hockey but can also be portioned to make basketball, dodgeball and racket sports available. It is currently marked to facilitate all of these. The area is clean, dry and has its own heating, the cushioned flooring making it safe for all. Because of its size, it is also suitable for aerobic, circuit and individual fitness sessions.It would be an excellent facility to hire for activities within a children’s party, giving the guests a vast amount of space to burn some energy off.', 'sportshall.jpg', 'sports', 20),
('13', 'Theatre', 'The recently re-decorated, 250 seated theatre has a traditional proscenium arch and stage and thus is a professional setting for performances or presentations of any type. Because the seating folds back, the space is sufficiently flexible to accommodate theatre in the round, more intimate musical events or fitness-related and dance activities. It is heated and well lit, with disabled access catered for – a beautiful setting for any event.\\r\\n<br />\\r\\n<a href=\\\"https://www.4dtours.co.uk/4d/the-pictures/fullscreen/\\\">Take a tour of our theatre!', 'theatre.jpg', 'arts', 20),
('14', 'The Gymnasium', '\'The heated gymnasium is ideal for either gymnastics, small group games, like dodgeball,trampolining, martial arts and a whole lot more. It would be an excellent facility to hire for activities within a children’s party, giving the guests a space to burn some energy off in. Because of its size, it is also suitable for aerobic, circuit and individual fitness sessions.', 'gym.jpg', 'sports', 20),
('15', 'Performing Arts Room', 'A very modern facility, the drama/dance studio provides a comfortable setting which is flexible enough to cater for a host of activities, both performing arts and fitness-related.', 'performingarts.jpg', 'arts', 20);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
