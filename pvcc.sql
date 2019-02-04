-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Feb 04, 2019 at 12:04 PM
-- Server version: 5.7.23
-- PHP Version: 7.2.10

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
(3, 'Dance Moves', 'Description Coming Soon', 'dancemoves.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
CREATE TABLE IF NOT EXISTS `rooms` (
  `roomId` int(11) NOT NULL AUTO_INCREMENT,
  `roomName` varchar(40) NOT NULL,
  `roomDescription` varchar(2000) NOT NULL,
  `roomImage` varchar(2000) NOT NULL,
  PRIMARY KEY (`roomId`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`roomId`, `roomName`, `roomDescription`, `roomImage`) VALUES
(1, 'Astro Turf', 'The multi-use games area has been newly refurbished and is a high class, floodlit facility available until 9pm each night.  It can be hired as a full or half pitch, depending upon the age group of user or the activity required. Because it is composed of synthetic carpet, it can be used for a host of sports, including football, netball and tennis.\r\n\r\nFree parking is available on site.', 'astroturf.jpg'),
(2, 'Classroom', 'The award winning Community Centre holds classrooms of differing sizes and thus can play host to a wide range of activities, including ICT and computing lessons. Because there are no fixed fittings, each room has the capability to act as a venue for meetings or interviews as well as adult education, with the largest being ideal for a birthday party.', 'classroom.jpg'),
(4, 'Sports Field', 'With a long-jump pit and two football pitches of varying size, this is an ideal venue to book for any outdoor event or field sports. It is spacious, well looked after and sheltered, as well as enjoying easy access to community facilities.', 'sportsfield.jpg'),
(3, 'Sports Hall', 'The size of the Sports Hall makes it incredibly flexible and thus user-friendly. At its largest, it is ideal for sports like indoor football (5 a side and its variants) and hockey but can also be portioned to make basketball, dodgeball and racket sports available. It is currently marked to facilitate all of these. The area is clean, dry and has its own heating, the cushioned flooring making it safe for all. Because of its size, it is also suitable for aerobic, circuit and individual fitness sessions.It would be an excellent facility to hire for activities within a children’s party, giving the guests a vast amount of space to burn some energy off.\r\n\r\nFree parking is available on site.', 'sportshall.jpg'),
(5, 'IT Suite', 'The IT Suite is equipped with 21 desk top computers.\r\nThis multipurpose room can be used as a general class room as monitors can be lowered into the purpose built desks. The room is spacious with additional round tables to allow for group working.\r\n', 'itsuite.jpg'),
(6, 'Theatre', 'The recently re-decorated, 250 seated theatre has a traditional proscenium arch and stage and thus is a professional setting for performances or presentations of any type. Because the seating folds back, the space is sufficiently flexible to accommodate theatre in the round, more intimate musical events or fitness-related and dance activities. It is heated and well lit, with disabled access catered for – a beautiful setting for any event.', 'theatre.jpg'),
(7, 'The Gymnasium', 'The heated gymnasium is ideal for either gymnastics, small group games, like dodgeball,trampolining, martial arts and a whole lot more. It would be an excellent facility to hire for activities within a children’s party, giving the guests a space to burn some energy off in. Because of its size, it is also suitable for aerobic, circuit and individual fitness sessions.\r\n', 'gym.jpg');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
