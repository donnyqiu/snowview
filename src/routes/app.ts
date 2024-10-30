import {
  Home,
  Dashboard,
  Code,
  Person,
  // ContentPaste,
  // LibraryBooks,
  // BubbleChart,
  // LocationOn,
  // Notifications
} from 'material-ui-icons';
import { SvgIconProps } from 'material-ui/SvgIcon';
import HomePage from '../pages/HomePage';
import DemoPage from '../pages/DemoPage/DemoPage';
import ResourcePage from '../pages/ResourcePage';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import AboutPage from '../pages/AboutPage';

export interface AppRoute {
  path: string;
  sidebarName: string;
  navbarName: string;
  icon: React.ComponentType<SvgIconProps>;
  exact: boolean;
  component: React.ComponentType<RouteComponentProps<{}>> | React.ComponentType<{}>;
}

const appRoutes: AppRoute[] = [
  {
    path: '/',
    sidebarName: 'Use It',
    navbarName: 'Use It',
    icon: Dashboard,
    exact: false,
    component: DemoPage
  }
];

export default appRoutes;